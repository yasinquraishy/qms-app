<script setup>
import { useDocuments } from '@/composables/useDocuments.js'
import { useQuasar } from 'quasar'

const props = defineProps({
  documentId: { type: String, required: true },
})
const emit = defineEmits(['confirm'])

const show = defineModel('show', { type: Boolean, default: false })

const { submitForReview } = useDocuments()
const $q = useQuasar()

// ── Local data from IDB ───────────────────────────────────────────────────
const document = useLiveQueryWithDeps([() => props.documentId], async (db, [documentId]) =>
  db.Document.findByPk(documentId),
)

const allWorkflowSteps = useLiveQueryWithDeps(
  [() => document.value.workflowVersionId],
  async (db, [workflowVersionId]) =>
    workflowVersionId
      ? db.ApprovalWorkflowStep.where('workflowVersionId', workflowVersionId)
          .orderBy('stepOrder')
          .exec()
      : [],
  {
    initial: [],
  },
)

const allStepUsers = useLiveQuery(async (db) => db.ApprovalWorkflowStepUser.where().exec(), {
  initial: [],
})

const allUsers = useLiveQuery(async (db) => db.User.where().exec(), { initial: [] })

const usersById = computed(() => {
  const map = {}
  for (const u of allUsers.value) map[u.id] = u
  return map
})

const steps = computed(() => {
  const stepUserMap = {}
  for (const su of allStepUsers.value ?? []) {
    if (!stepUserMap[su.stepId]) stepUserMap[su.stepId] = []
    stepUserMap[su.stepId].push(su)
  }

  return allWorkflowSteps.map((step) => {
    step.reviewers = (stepUserMap[step.id] ?? [])
      .map((su) => usersById.value[su.userId])
      .filter(Boolean)
    return step
  })
})

const loading = computed(() => document.value === undefined)

// ── Actions ────────────────────────────────────────────────────────────────
async function confirm() {
  try {
    const result = await submitForReview(props.documentId)
    if (result.error) {
      $q.notify({ type: 'negative', message: result.error })
      return
    }
    $q.notify({ type: 'positive', message: 'Document submitted for review' })
    emit('confirm')
  } finally {
    show.value = false
  }
}
</script>

<template>
  <WDialog v-model="show" title="Workflow Preview" :minWidth="'640px'" persistent>
    <div class="tw:p-4 tw:max-h-[60vh] tw:overflow-auto">
      <div v-if="loading" class="tw:flex tw:items-center tw:justify-center tw:py-12">
        <QSpinner size="40px" color="primary" />
      </div>

      <div v-else class="tw:space-y-4">
        <h2 class="tw:text-lg tw:font-bold tw:text-on-main tw:px-1">Approval Workflow</h2>

        <div v-for="(step, idx) in steps" :key="step.id" class="tw:relative tw:pl-8 tw:group">
          <!-- Vertical connector line -->
          <div
            v-if="idx < steps.length - 1"
            class="tw:absolute tw:left-2.75 tw:top-6 tw:bottom-0 tw:w-0.5 tw:bg-divider"
          ></div>

          <!-- Step circle indicator -->
          <div
            class="tw:absolute tw:left-0 tw:top-6 tw:size-6 tw:rounded-full tw:bg-main tw:border-2 tw:border-divider tw:flex tw:items-center tw:justify-center tw:text-secondary tw:z-10 tw:text-xs tw:font-bold"
          >
            {{ step.stepOrder }}
          </div>

          <!-- Step card -->
          <div
            class="tw:bg-main-hover tw:rounded-xl tw:border tw:border-dashed tw:border-divider tw:p-5"
          >
            <!-- Step header -->
            <div class="tw:mb-4">
              <h3 class="tw:font-bold tw:text-on-main">
                Step {{ step.stepOrder }}: {{ step.name }}
              </h3>
              <p class="tw:text-xs tw:text-secondary tw:mt-0.5">
                Rule: {{ step.approvalRule }} &bull;
                {{
                  step.approvalRule === 'ANY'
                    ? 'First approval completes step'
                    : 'All reviewers must approve'
                }}
              </p>
            </div>

            <!-- Reviewers -->
            <div class="tw:space-y-2">
              <div
                v-for="reviewer in step.reviewers"
                :key="reviewer.id"
                class="tw:flex tw:items-center tw:gap-3"
              >
                <UserAvatar :user="reviewer" class="tw:size-8" />
                <div>
                  <p class="tw:text-sm tw:font-semibold tw:text-on-main">
                    {{ reviewer.firstName }} {{ reviewer.lastName }}
                  </p>
                  <p class="tw:text-xs tw:text-secondary">{{ reviewer.email }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #actions>
      <WBtn flat @click="show = false">Cancel</WBtn>
      <WBtn color="primary" unelevated @click="confirm">Submit</WBtn>
    </template>
  </WDialog>
</template>

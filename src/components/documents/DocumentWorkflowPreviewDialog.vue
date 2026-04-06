<script setup>
import { useDocuments } from '@/composables/useDocuments.js'
import { useQuasar } from 'quasar'

const props = defineProps({
  documentId: { type: String, required: true },
})
const emit = defineEmits(['confirm'])

const show = defineModel('show', { type: Boolean, default: false })

const loading = ref(false)
const version = ref({})
const { previewWorkflow, submitForReview } = useDocuments()
const $q = useQuasar()

const steps = computed(() => version.value.steps || [])

watch(
  () => show.value,
  async (v) => {
    if (v) {
      loading.value = true
      try {
        const res = await previewWorkflow(props.documentId)
        version.value = res.version || {}
      } finally {
        loading.value = false
      }
    }
  },
)

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

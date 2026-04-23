<script setup>
import { useDebounceFn } from '@vueuse/core'
import {
  IconNote,
  IconUsers,
  IconInfoCircle,
  IconAlertCircle,
  IconListCheck,
  IconCornerLeftUp,
} from '@tabler/icons-vue'

const props = defineProps({
  stepId: { type: String, required: true },
  canUpdate: { type: Boolean, default: false },
  showAllowedOutcomes: { type: Boolean, default: false },
  showSendBackTargets: { type: Boolean, default: false },
  showFormSchema: { type: Boolean, default: false },
})

const step = useLiveQueryWithDeps([() => props.stepId], async (db, [stepId]) => {
  if (!stepId) return null
  return await db.WorkflowStep.findByPk(stepId)
})

const debouncedStepSave = useDebounceFn(async () => {
  if (!step.value || !props.canUpdate) return
  await step.value.save()
}, 800)

watch(
  step,
  (_, oldStep) => {
    if (!props.canUpdate || oldStep === undefined) return
    debouncedStepSave()
  },
  { deep: true },
)

// Step roles and step users counts for warning/error callouts
const stepRoles = useLiveQueryWithDeps(
  [() => props.stepId],
  async (db, [stepId]) => {
    if (!stepId) return []
    return await db.WorkflowStepRole.where('stepId', stepId).exec()
  },
  { initial: [] },
)

const stepUsers = useLiveQueryWithDeps(
  [() => props.stepId],
  async (db, [stepId]) => {
    if (!stepId) return []
    return await db.WorkflowStepUser.where('stepId', stepId).exec()
  },
  { initial: [] },
)

const roleIds = computed(() => stepRoles.value.map((sr) => sr.roleId))
const reviewerIds = computed(() => stepUsers.value.map((su) => su.userId))

const approverTab = ref('roles')

// ─── Allowed Outcomes ─────────────────────────────────────────────────────────

const allOutcomes = useLiveQuery(
  async (db) => db.WorkflowStepOutcome.where().orderBy('displayOrder', 'asc').exec(),
  { initial: [] },
)

const allowedOutcomes = useLiveQueryWithDeps(
  [() => props.stepId],
  async (db, [stepId]) => {
    if (!stepId) return []
    return await db.AllowedOutcomeOnStep.where('stepId', stepId).exec()
  },
  { initial: [] },
)

const allowedOutcomeIds = computed(() => new Set(allowedOutcomes.value.map((o) => o.outcomeId)))
const isSendBackActive = computed(() => allowedOutcomeIds.value.has('SEND_BACK'))

const toggleOutcome = useLiveMutation(async (db, outcomeId) => {
  const existing = allowedOutcomes.value.find((o) => o.outcomeId === outcomeId)
  if (existing) {
    await existing.delete()
  } else {
    const record = db.AllowedOutcomeOnStep.create({ stepId: props.stepId, outcomeId })
    await record.save()
  }
})

// ─── Send-Back Targets ────────────────────────────────────────────────────────

const siblingSteps = useLiveQueryWithDeps(
  [() => step.value?.workflowVersionId, () => step.value?.stepOrder],
  async (db, [versionId, stepOrder]) => {
    if (!versionId) return []
    const all = await db.WorkflowStep.where('workflowVersionId', versionId).exec()
    return all.filter((s) => s.stepOrder < stepOrder).sort((a, b) => a.stepOrder - b.stepOrder)
  },
  { initial: [] },
)

const sendBackTargets = useLiveQueryWithDeps(
  [() => props.stepId],
  async (db, [stepId]) => {
    if (!stepId) return []
    return await db.StepSendBackTarget.where('stepId', stepId).exec()
  },
  { initial: [] },
)

const sendBackTargetIds = computed(() => new Set(sendBackTargets.value.map((t) => t.targetStepId)))

const toggleSendBackTarget = useLiveMutation(async (db, targetStepId) => {
  const existing = sendBackTargets.value.find((t) => t.targetStepId === targetStepId)
  if (existing) {
    await existing.delete()
  } else {
    const record = db.StepSendBackTarget.create({ stepId: props.stepId, targetStepId })
    await record.save()
  }
})
</script>

<template>
  <div v-if="step" class="tw:space-y-10">
    <!-- Step Details -->
    <div class="tw:space-y-6">
      <div class="tw:flex tw:items-center tw:gap-2 tw:text-secondary tw:mb-2">
        <IconNote :size="22" />
        <h2 class="tw:text-lg tw:font-bold tw:text-on-main">Step Configuration: {{ step.name }}</h2>
      </div>

      <div class="tw:grid tw:grid-cols-1 tw:md:grid-cols-2 tw:gap-6">
        <!-- Left Column -->
        <div class="tw:space-y-4">
          <div>
            <label class="tw:block tw:text-xs tw:font-bold tw:text-secondary tw:uppercase tw:mb-2">
              Step Name
            </label>
            <BaseTextInput
              v-model="step.name"
              name="name"
              placeholder="e.g. Peer Review"
              :disabled="!canUpdate"
            />
          </div>
          <div>
            <label class="tw:block tw:text-xs tw:font-bold tw:text-secondary tw:uppercase tw:mb-2">
              Description
            </label>
            <BaseTextarea
              v-model="step.description"
              placeholder="Describe what happens at this step..."
              :disabled="!canUpdate"
            />
          </div>
        </div>

        <!-- Right Column -->
        <div class="tw:space-y-6">
          <!-- Approval Rule -->
          <div>
            <label class="tw:block tw:text-xs tw:font-bold tw:text-secondary tw:uppercase tw:mb-3">
              Approval Rule
            </label>
            <div class="tw:grid tw:grid-cols-2 tw:gap-3">
              <label
                class="tw:relative tw:flex tw:flex-col tw:p-4 tw:border tw:rounded-xl tw:cursor-pointer tw:transition-all"
                :class="
                  step.approvalRule === 'ALL'
                    ? 'tw:border-primary tw:bg-primary/5 tw:ring-1 tw:ring-primary/20'
                    : 'tw:border-divider tw:hover:bg-main-hover'
                "
              >
                <input
                  v-model="step.approvalRule"
                  type="radio"
                  value="ALL"
                  class="tw:sr-only"
                  :disabled="!canUpdate"
                />
                <span
                  class="tw:text-xs tw:font-bold tw:mb-1"
                  :class="step.approvalRule === 'ALL' ? 'tw:text-primary' : 'tw:text-on-main'"
                >
                  ALL
                </span>
                <span class="tw:text-[10px] tw:leading-tight tw:text-secondary">
                  All assigned approvers must approve to advance.
                </span>
              </label>
              <label
                class="tw:relative tw:flex tw:flex-col tw:p-4 tw:border tw:rounded-xl tw:cursor-pointer tw:transition-all"
                :class="
                  step.approvalRule === 'ANY'
                    ? 'tw:border-primary tw:bg-primary/5 tw:ring-1 tw:ring-primary/20'
                    : 'tw:border-divider tw:hover:bg-main-hover'
                "
              >
                <input
                  v-model="step.approvalRule"
                  type="radio"
                  value="ANY"
                  class="tw:sr-only"
                  :disabled="!canUpdate"
                />
                <span
                  class="tw:text-xs tw:font-bold tw:mb-1"
                  :class="step.approvalRule === 'ANY' ? 'tw:text-primary' : 'tw:text-on-main'"
                >
                  ANY
                </span>
                <span class="tw:text-[10px] tw:leading-tight tw:text-secondary">
                  Only one approver needs to sign to advance.
                </span>
              </label>
            </div>
          </div>

          <!-- SLA Days -->
          <div>
            <label class="tw:block tw:text-xs tw:font-bold tw:text-secondary tw:uppercase tw:mb-2">
              SLA: Due in (days)
            </label>
            <div class="tw:flex tw:items-center tw:gap-2">
              <BaseTextInput
                v-model="step.slaDays"
                type="number"
                placeholder="e.g. 5"
                :disabled="!canUpdate"
                inputClass="tw:w-24"
                :min="1"
              />
              <span class="tw:text-xs tw:font-medium tw:text-secondary">
                Business days from activation
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Compliance Controls -->
    <div
      class="tw:grid tw:grid-cols-2 tw:gap-4 tw:p-6 tw:bg-main-hover tw:rounded-2xl tw:border tw:border-divider"
    >
      <label class="tw:flex tw:items-center tw:gap-3 tw:cursor-pointer">
        <BaseCheckbox v-model="step.requireComments" :disabled="!canUpdate" />
        <span class="tw:text-xs tw:font-semibold tw:text-on-main">Require Comments</span>
      </label>
      <label class="tw:flex tw:items-center tw:gap-3 tw:cursor-pointer">
        <BaseCheckbox v-model="step.requireEsignature" :disabled="!canUpdate" />
        <span class="tw:text-xs tw:font-semibold tw:text-on-main">Require E-signature</span>
      </label>
    </div>

    <!-- Allowed Outcomes -->
    <div v-if="showAllowedOutcomes" class="tw:space-y-4">
      <div class="tw:flex tw:items-center tw:gap-2 tw:text-secondary">
        <IconListCheck :size="22" />
        <h2 class="tw:text-lg tw:font-bold tw:text-on-main">Allowed Outcomes</h2>
      </div>
      <p class="tw:text-xs tw:text-secondary">
        Actions the assignee can take to complete this step. Each outcome triggers a different path
        in the workflow.
      </p>
      <div class="tw:flex tw:flex-wrap tw:gap-2 tw:mt-2">
        <BaseButton
          v-for="o in allOutcomes"
          :key="o.id"
          :variant="allowedOutcomeIds.has(o.id) ? 'primary' : 'outline'"
          size="md"
          :disabled="!canUpdate"
          @click="toggleOutcome(o.id)"
        >
          <template #icon>
            <component
              :is="
                o.id === 'APPROVE'
                  ? IconCheck
                  : o.id === 'REJECT'
                    ? IconX
                    : o.id === 'SEND_BACK'
                      ? IconCornerLeftUp
                      : IconListCheck
              "
              :size="14"
            />
          </template>
          {{ o.name }}
        </BaseButton>
      </div>
    </div>

    <!-- Send-Back Targets -->
    <div v-if="showSendBackTargets && isSendBackActive" class="tw:space-y-4">
      <div class="tw:flex tw:items-center tw:gap-2 tw:text-secondary">
        <IconCornerLeftUp :size="22" />
        <h2 class="tw:text-lg tw:font-bold tw:text-on-main">Send-Back Targets</h2>
      </div>
      <p class="tw:text-xs tw:text-secondary">
        Which earlier steps this one can send back to. A send-back creates a new instance of the
        target step.
      </p>
      <div v-if="siblingSteps.length === 0" class="tw:text-xs tw:text-secondary tw:italic tw:px-1">
        First step — nothing to send back to.
      </div>
      <div v-else class="tw:space-y-2">
        <label
          v-for="s in siblingSteps"
          :key="s.id"
          class="tw:flex tw:items-center tw:gap-3"
          :class="canUpdate ? 'tw:cursor-pointer' : 'tw:cursor-default tw:opacity-60'"
        >
          <BaseCheckbox
            :modelValue="sendBackTargetIds.has(s.id)"
            :disabled="!canUpdate"
            @update:modelValue="canUpdate && toggleSendBackTarget(s.id)"
          />
          <span
            class="tw:inline-flex tw:items-center tw:justify-center tw:w-5 tw:h-5 tw:text-[10px] tw:font-bold tw:bg-main-hover tw:border tw:border-divider tw:rounded tw:text-secondary"
          >
            {{ s.stepOrder }}
          </span>
          <span class="tw:text-xs tw:font-medium tw:text-on-main">{{ s.name }}</span>
        </label>
      </div>
    </div>

    <!-- Step Approvers -->
    <div class="tw:space-y-4">
      <div class="tw:flex tw:items-center tw:justify-between">
        <div class="tw:flex tw:items-center tw:gap-2 tw:text-secondary">
          <IconUsers :size="22" />
          <h2 class="tw:text-lg tw:font-bold tw:text-on-main">Step Approvers</h2>
        </div>
      </div>

      <!-- Warning Callout -->
      <div
        v-if="roleIds.length > 0 && reviewerIds.length > 0"
        class="tw:bg-warning/10 tw:border tw:border-warning/30 tw:p-4 tw:rounded-xl tw:flex tw:gap-3"
      >
        <IconInfoCircle :size="20" class="tw:text-warning tw:shrink-0" />
        <div class="tw:text-xs tw:text-warning">
          <p class="tw:font-bold tw:mb-0.5">Union Selection Logic</p>
          <p>
            Selecting both roles and individual users will result in a
            <strong>union</strong> of all participants being assigned to this step.
          </p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tw:border tw:border-divider tw:rounded-xl tw:overflow-hidden">
        <div class="tw:flex tw:border-b tw:border-divider tw:bg-main-hover">
          <button
            class="tw:px-6 tw:py-3 tw:text-xs tw:font-bold tw:transition-colors"
            :class="
              approverTab === 'roles'
                ? 'tw:text-primary tw:border-b-2 tw:border-primary tw:bg-main'
                : 'tw:text-secondary tw:hover:text-on-main'
            "
            @click="approverTab = 'roles'"
          >
            BY ROLE
          </button>
          <button
            class="tw:px-6 tw:py-3 tw:text-xs tw:font-bold tw:transition-colors"
            :class="
              approverTab === 'users'
                ? 'tw:text-primary tw:border-b-2 tw:border-primary tw:bg-main'
                : 'tw:text-secondary tw:hover:text-on-main'
            "
            @click="approverTab = 'users'"
          >
            BY USERS
          </button>
        </div>

        <div class="tw:p-6">
          <WorkflowRoleSelector
            v-show="approverTab === 'roles'"
            :stepId="step.id"
            :canUpdate="canUpdate"
          />
          <WorkflowUserSelector
            v-show="approverTab === 'users'"
            :stepId="step.id"
            :canUpdate="canUpdate"
          />
        </div>
      </div>

      <!-- Approver Error -->
      <div
        v-if="roleIds.length === 0 && reviewerIds.length === 0"
        class="tw:flex tw:items-center tw:gap-2 tw:text-bad tw:px-1"
      >
        <IconAlertCircle :size="14" class="tw:text-bad" />
        <span class="ds-label-sm"> At least one approver must be selected for this step </span>
      </div>
    </div>

    <!-- Form Schema -->
    <WorkflowStepFormSchema v-if="showFormSchema" :stepId="stepId" :canUpdate="canUpdate" />
  </div>
</template>

<script setup>
import { IconPlus } from '@tabler/icons-vue'
import { currentCompany } from '@/utils/currentCompany.js'

const props = defineProps({
  versionId: { type: String, required: true },
  canUpdate: { type: Boolean, default: false },
  autoAddStep: { type: Boolean, default: false },
})

const stepId = defineModel('stepId', {
  type: String,
  default: null,
})

const steps = useLiveQueryWithDeps(
  [() => props.versionId],
  async (db, [vId]) => {
    if (!vId) return []
    return db.WorkflowTemplateStage.where('workflowVersionId', vId).orderBy('stepOrder').exec()
  },
  { initial: [] },
)

// Auto-add first step when autoAddStep is enabled and version has no steps
watch(steps, async (newSteps) => {
  if (props.autoAddStep && props.canUpdate && newSteps?.length === 0 && props.versionId) {
    await nextTick()
    await addStep()
  }
})

function selectStep(step) {
  stepId.value = step.id
}

const createStep = useLiveMutation(async (db, { versionId, order, settings }) => {
  const s = settings || {}
  const step = db.WorkflowTemplateStage.create({
    workflowVersionId: versionId,
    name: `Step ${order}`,
    description: '',
    stepOrder: order,
    approvalRule: s.defaultWorkflowTemplateApprovalRule ?? 'ALL',
    slaDays: s.defaultSla ?? null,
    requireComments: s.defaultWorkflowTemplateRequireComment ?? false,
    requireEsignature: s.defaultWorkflowTemplateRequireSignature ?? false,
  })
  await step.save()
  return step
})

async function addStep() {
  const s = currentCompany.value?.settings || {}
  const order = steps.value.length + 1
  const step = await createStep({ versionId: props.versionId, order, settings: s })
  if (step) stepId.value = step.id
}

async function removeStep(index) {
  const step = steps.value[index]
  if (!step) return
  const wasSelected = stepId.value === step.id
  await step.delete()
  // Reorder remaining
  const remaining = steps.value.filter((_, i) => i !== index)
  await Promise.all(
    remaining.map((s, i) => {
      s.stepOrder = i + 1
      return s.save()
    }),
  )
  if (wasSelected) {
    const newIndex = Math.max(0, index - 1)
    stepId.value = remaining[newIndex]?.id ?? null
  }
}

async function moveStepUp(index) {
  if (index > 0) await swapSteps(index, index - 1)
}

async function moveStepDown(index) {
  if (index < steps.value.length - 1) await swapSteps(index, index + 1)
}

async function swapSteps(fromIndex, toIndex) {
  const a = steps.value[fromIndex]
  const b = steps.value[toIndex]
  if (!a || !b) return
  const tmpOrder = a.stepOrder
  a.stepOrder = b.stepOrder
  b.stepOrder = tmpOrder
  await Promise.all([a.save(), b.save()])
  stepId.value = a.id
}

defineExpose({ addStep })
</script>

<template>
  <aside
    class="tw:w-80 tw:lg:w-96 tw:bg-main-hover tw:border-r tw:border-divider tw:flex tw:flex-col tw:shrink-0"
  >
    <!-- Header -->
    <div class="tw:p-4 tw:border-b tw:border-divider tw:flex tw:items-center tw:justify-between">
      <h2 class="ds-label tw:text-on-main">Workflow Sequence</h2>
      <span
        class="tw:text-xs tw:font-medium tw:text-secondary tw:bg-main tw:px-2 tw:py-0.5 tw:rounded"
      >
        {{ steps?.length ?? 0 }} Step{{ (steps?.length ?? 0) !== 1 ? 's' : '' }}
      </span>
    </div>

    <!-- Step Cards -->
    <div class="tw:flex-1 tw:overflow-y-auto tw:p-4 tw:space-y-3">
      <WorkflowTemplateStageCard
        v-for="(step, index) in steps"
        :key="step.id ?? index"
        :step="step"
        :index="index"
        :isSelected="step.id === stepId"
        :isFirst="index === 0"
        :isLast="index === steps.length - 1"
        :canUpdate="canUpdate"
        @select="selectStep(step)"
        @remove="removeStep(index)"
        @moveUp="moveStepUp(index)"
        @moveDown="moveStepDown(index)"
      />

      <!-- Add Step Button -->
      <button
        v-if="canUpdate"
        class="tw:w-full tw:py-4 tw:border-2 tw:border-dashed tw:border-divider tw:rounded-xl tw:flex tw:items-center tw:justify-center tw:gap-2 tw:text-secondary tw:hover:text-primary tw:hover:border-primary tw:hover:bg-primary/5 tw:transition-all"
        @click="addStep"
      >
        <IconPlus :size="20" />
        <span class="tw:text-sm tw:font-bold">Add Step</span>
      </button>
    </div>
  </aside>
</template>

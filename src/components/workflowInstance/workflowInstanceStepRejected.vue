<script setup>
const props = defineProps({
  instanceStepId: { type: String, required: true },
})

const instanceStep = useLiveQueryWithDeps(
  [() => props.instanceStepId],
  async (db, [instanceStepId]) => {
    if (!instanceStepId) return null
    return db.WorkflowInstanceStep.findByPk(instanceStepId)
  },
)

const step = useLiveQueryWithDeps([() => instanceStep.value?.stepId], async (db, [stepId]) => {
  if (!stepId) return null
  return db.WorkflowStage.findByPk(stepId)
})
</script>

<template>
  <div class="tw:bg-sidebar tw:rounded-xl tw:border tw:border-red-200 tw:p-5 tw:shadow-sm">
    <div class="tw:flex tw:items-center tw:justify-between">
      <div>
        <h3 class="tw:font-bold tw:text-on-main">
          Step {{ instanceStep?.stepNumber }}: {{ step?.name }}
        </h3>
        <p class="tw:text-xs tw:text-secondary">Rule: {{ step?.approvalRule }}</p>
      </div>
      <WorkflowInstanceStepStatusBadgeById :statusId="instanceStep?.statusId" />
    </div>
  </div>
</template>

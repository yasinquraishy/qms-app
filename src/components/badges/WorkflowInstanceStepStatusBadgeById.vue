<script setup>
const props = defineProps({
  statusId: { type: String, required: true },
  showDot: { type: Boolean, default: false },
  hideLabel: { type: Boolean, default: false },
})

const status = useLiveQueryWithDeps([() => props.statusId], async (db, [statusId]) => {
  if (!statusId) return null
  return db.WorkflowInstanceStepStatus.findByPk(statusId)
})
</script>

<template>
  <WorkflowInstanceStepStatusBadge
    v-if="status"
    :status="status"
    :showDot="showDot"
    :hideLabel="hideLabel"
    v-bind="$attrs"
  />
</template>

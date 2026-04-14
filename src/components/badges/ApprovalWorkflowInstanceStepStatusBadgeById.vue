<script setup>
const props = defineProps({
  statusId: { type: String, required: true },
  showDot: { type: Boolean, default: false },
  hideLabel: { type: Boolean, default: false },
})

const status = useLiveQueryWithDeps(
  [() => props.statusId],
  async (db, [statusId]) => {
    if (!statusId) return null
    return db.ApprovalWorkflowInstanceStepStatus.findByPk(statusId)
  },
  { initial: { id: props.statusId } },
)
</script>

<template>
  <ApprovalWorkflowInstanceStepStatusBadge
    v-if="statusId"
    :status="status"
    :showDot="showDot"
    :hideLabel="hideLabel"
    v-bind="$attrs"
  />
</template>

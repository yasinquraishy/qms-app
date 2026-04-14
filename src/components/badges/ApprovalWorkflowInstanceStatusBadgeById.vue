<script setup>
const props = defineProps({
  statusId: { type: String, default: null },
  showDot: { type: Boolean, default: false },
})

const status = useLiveQueryWithDeps([() => props.statusId], async (db, [statusId]) => {
  if (!statusId) return null
  return db.ApprovalWorkflowInstanceStatus.findByPk(statusId)
})
</script>

<template>
  <ApprovalWorkflowInstanceStatusBadge
    v-if="status"
    :status="status"
    :showDot="showDot"
    v-bind="$attrs"
  />
</template>

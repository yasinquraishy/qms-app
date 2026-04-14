<script setup>
const props = defineProps({
  statusId: { type: String, default: null },
  showDot: { type: Boolean, default: false },
})

const status = useLiveQueryWithDeps(
  [() => props.statusId],
  async (db, [statusId]) => {
    if (!statusId) return null
    return db.ApprovalWorkflowInstanceStatus.findByPk(statusId)
  },
  { initial: { id: props.statusId } },
)
</script>

<template>
  <ApprovalWorkflowInstanceStatusBadge
    v-if="statusId"
    :status="status"
    :showDot="showDot"
    v-bind="$attrs"
  />
</template>

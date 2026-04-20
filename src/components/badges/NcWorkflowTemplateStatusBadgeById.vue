<script setup>
const props = defineProps({
  statusId: {
    type: String,
    default: null,
  },
})

const status = useLiveQueryWithDeps(
  [() => props.statusId],
  async (db, [statusId]) => {
    if (!statusId) return null
    return db.NcWorkflowTemplateStatus.findByPk(statusId)
  },
  { initial: null },
)
</script>

<template>
  <NcWorkflowTemplateStatusBadge v-if="status" :status="status" v-bind="$attrs">
    <template v-if="$slots.icon" #icon>
      <slot name="icon" />
    </template>
  </NcWorkflowTemplateStatusBadge>
</template>

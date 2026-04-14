<script setup>
const props = defineProps({
  statusId: { type: String, default: null },
  showDot: { type: Boolean, default: true },
})

const status = useLiveQueryWithDeps(
  [() => props.statusId],
  async (db, [statusId]) => {
    if (!statusId) return null
    return db.FormStatus.findByPk(statusId)
  },
  { initial: { id: props.statusId } },
)
</script>

<template>
  <FormTemplateStatusBadge v-if="statusId" :status="status" :showDot="showDot" v-bind="$attrs" />
</template>

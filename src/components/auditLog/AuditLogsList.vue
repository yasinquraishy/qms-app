<script setup>
defineProps({
  logs: {
    type: Array,
    required: true,
  },
})
</script>

<template>
  <div class="tw:bg-sidebar tw:rounded-xl tw:border tw:border-divider tw:overflow-hidden">
    <div class="tw:divide-y tw:divide-divider">
      <AuditLogsItem v-for="log in logs" :key="log.id" :log="log" />
    </div>
  </div>
</template>

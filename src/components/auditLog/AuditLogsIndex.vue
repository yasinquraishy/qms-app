<script setup>
import { provideAuditLogs } from '@/composables/useAuditLogs.js'

provideAuditLogs()
</script>

<template>
  <AuditLogsHome />
</template>

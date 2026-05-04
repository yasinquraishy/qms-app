<script setup>
import { IconShield } from '@tabler/icons-vue'
import { useAuditLogs } from '@/composables/useAuditLogs.js'

const { auditLogs, loading } = useAuditLogs()
</script>

<template>
  <div class="tw:flex tw:flex-col tw:gap-4 tw:h-full tw:p-5">
    <SafeTeleport to="#main-header-title">
      <div>
        <div class="tw:text-xl tw:font-bold tw:text-on-main">Audit Logs</div>
        <div class="tw:text-xs tw:text-secondary tw:hidden tw:sm:block">
          Tamper-evident record of all system actions.
        </div>
      </div>
    </SafeTeleport>

    <SafeTeleport to="#main-header-actions">
      <AuditLogsFilters />
    </SafeTeleport>

    <!-- Loading -->
    <div v-if="loading" class="tw:flex tw:justify-center tw:py-16">
      <div
        class="tw:size-10 tw:animate-spin tw:rounded-full tw:border-2 tw:border-primary tw:border-t-transparent"
      ></div>
    </div>

    <!-- Logs list -->
    <AuditLogsList v-else-if="auditLogs?.length" :logs="auditLogs" />

    <!-- Empty state -->
    <BaseEmptyState
      v-else
      :icon="IconShield"
      title="No audit log entries found"
      description="Audit logs will appear here as actions are performed."
      dense
    />
  </div>
</template>

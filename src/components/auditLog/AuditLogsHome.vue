<script setup>
import { useAuditLogs } from '@/composables/useAuditLogs.js'

const { grouped, loading, filters, fetchAuditLogs } = useAuditLogs()

const ENTITY_TYPES = [
  { label: 'All Types', value: null },
  { label: 'Document', value: 'Document' },
  { label: 'Document Version', value: 'DocumentVersion' },
  { label: 'Document Section', value: 'DocumentVersionSection' },
  { label: 'Document Link', value: 'DocumentLink' },
  { label: 'Approval Workflow', value: 'ApprovalWorkflowInstance' },
]

const moduleOrder = ['DOCUMENT_CONTROL', 'TRAINING_MANAGEMENT', 'NON_CONFORMANCE', 'CAPA', 'OTHER']

const sortedModules = computed(() => {
  return moduleOrder
    .filter((id) => grouped.value[id]?.length)
    .map((id) => ({ id, logs: grouped.value[id] }))
})

onMounted(() => fetchAuditLogs())
</script>

<template>
  <div class="tw:flex tw:flex-col tw:gap-4 tw:h-full tw:p-5">
    <SafeTeleport to="#main-header-title">
      <div>
        <div class="tw:text-xl tw:font-bold tw:text-on-main">Audit Logs</div>
        <div class="tw:text-xs tw:text-secondary tw:hidden tw:sm:block">
          Tamper-evident record of all system actions, grouped by module.
        </div>
      </div>
    </SafeTeleport>

    <SafeTeleport to="#main-header-actions">
      <WSelect
        v-model="filters.entityType"
        :options="ENTITY_TYPES"
        outlined
        dense
        emitValue
        mapOptions
        optionLabel="label"
        optionValue="value"
        style="min-width: 180px"
      />
    </SafeTeleport>

    <!-- Loading -->
    <div v-if="loading" class="tw:flex tw:justify-center tw:py-16">
      <QSpinner color="primary" size="40px" />
    </div>

    <!-- Module groups -->
    <AuditLogsList v-else-if="sortedModules.length" :sortedModules="sortedModules" />

    <!-- Empty state -->
    <WEmptyState
      v-else
      icon="policy"
      title="No audit log entries found"
      description="Audit logs will appear here as actions are performed."
      compact
    />
  </div>
</template>

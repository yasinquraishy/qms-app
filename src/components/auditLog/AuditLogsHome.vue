<script setup>
import { IconShield } from '@tabler/icons-vue'
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

const entityTypeItems = computed(() => ENTITY_TYPES.map((t) => ({ id: t.value, name: t.label })))

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
      <BaseSelectMenu
        v-model="filters.entityType"
        :items="entityTypeItems"
        style="min-width: 180px"
      >
        <template #button>
          <span class="tw:text-sm tw:font-medium tw:min-w-40">
            {{ entityTypeItems.find((i) => i.id === filters.entityType)?.name || 'All Types' }}
          </span>
        </template>
      </BaseSelectMenu>
    </SafeTeleport>

    <!-- Loading -->
    <div v-if="loading" class="tw:flex tw:justify-center tw:py-16">
      <div
        class="tw:size-10 tw:animate-spin tw:rounded-full tw:border-2 tw:border-primary tw:border-t-transparent"
      ></div>
    </div>

    <!-- Module groups -->
    <AuditLogsList v-else-if="sortedModules.length" :sortedModules="sortedModules" />

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

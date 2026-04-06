<script setup>
import { useDocuments } from '@/composables/useDocuments.js'

const props = defineProps({
  documentId: {
    type: String,
    required: true,
  },
})

const { fetchAuditLogs } = useDocuments()

const auditLogs = ref([])
const loading = ref(true)

function getActionIcon(action) {
  const map = {
    CREATE: 'add_circle',
    UPDATE: 'edit',
    DELETE: 'delete',
    STATUS_CHANGE: 'swap_horiz',
    SUBMIT_FOR_REVIEW: 'send',
    APPROVE: 'check_circle',
    REJECT: 'cancel',
    ARCHIVE: 'inventory_2',
    VERSION_CREATE: 'history',
    LINK_CREATE: 'link',
    LINK_DELETE: 'link_off',
  }
  return map[action] || 'info'
}

function getActionColor(action) {
  const map = {
    CREATE: 'tw:text-green-600',
    APPROVE: 'tw:text-green-600',
    REJECT: 'tw:text-red-600',
    DELETE: 'tw:text-red-600',
    ARCHIVE: 'tw:text-gray-500',
  }
  return map[action] || 'tw:text-blue-600'
}

function getPerformerName(log) {
  if (!log.performer) return 'System'
  return `${log.performer.firstName} ${log.performer.lastName}`.trim()
}

async function loadAuditLogs() {
  loading.value = true
  const result = await fetchAuditLogs(props.documentId)
  if (result.auditLogs) {
    auditLogs.value = result.auditLogs
  }
  loading.value = false
}

onMounted(() => {
  loadAuditLogs()
})
</script>

<template>
  <div class="tw:p-6">
    <h3 class="tw:text-lg tw:font-bold tw:text-on-sidebar tw:mb-4">Audit Log</h3>

    <!-- Loading -->
    <div v-if="loading" class="tw:flex tw:justify-center tw:py-8">
      <QSpinner color="primary" size="32px" />
    </div>

    <!-- Timeline -->
    <div v-else-if="auditLogs.length > 0" class="tw:space-y-3">
      <div
        v-for="log in auditLogs"
        :key="log.id"
        class="tw:flex tw:gap-4 tw:p-3 tw:bg-main-hover tw:rounded-lg"
      >
        <div class="tw:shrink-0">
          <WIcon
            :name="getActionIcon(log.action)"
            :class="getActionColor(log.action)"
            size="22px"
          />
        </div>
        <div class="tw:flex-1">
          <div class="tw:flex tw:items-center tw:justify-between">
            <div class="tw:text-sm tw:font-semibold tw:text-on-sidebar">
              {{ log.action.replace(/_/g, ' ') }}
            </div>
            <div class="tw:text-xs tw:text-secondary">
              {{ log.performedAt.formatDate('date') }}
            </div>
          </div>
          <div class="tw:text-xs tw:text-secondary tw:mt-0.5">by {{ getPerformerName(log) }}</div>
          <div v-if="log.details" class="tw:text-xs tw:text-secondary tw:mt-1">
            {{ typeof log.details === 'string' ? log.details : JSON.stringify(log.details) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else class="tw:text-center tw:py-8 tw:text-secondary">
      <WIcon name="policy" size="40px" class="tw:text-secondary tw:mb-2" />
      <div>No audit log entries yet.</div>
    </div>
  </div>
</template>

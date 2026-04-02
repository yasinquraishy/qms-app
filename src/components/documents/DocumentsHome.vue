<script setup>
import { useQuasar } from 'quasar'
import { useDocuments } from '@/composables/useDocuments.js'
import { isAllowed } from '@/utils/currentSession.js'
import { getCompanyPath } from '@/utils/routeHelpers.js'

const router = useRouter()
const $q = useQuasar()

const {
  documents,
  loading,
  filters,
  stats,
  statsTotal,
  statsLoading,
  archiveDocument,
  fetchDocuments,
  fetchStats,
} = useDocuments()

const canCreate = computed(() => isAllowed(['documents:create']))
const canUpdate = computed(() => isAllowed(['documents:update']))
const canArchive = computed(() => isAllowed(['documents:delete']))

function navigateToCreate() {
  router.push(getCompanyPath('/documents/create'))
}

function navigateToDetail(row) {
  router.push(getCompanyPath(`/documents/${row.id}`))
}

async function onArchiveDocument(row) {
  $q.dialog({
    title: 'Confirm Archive',
    message: `Are you sure you want to archive "${row.title}" (${row.docNumber})? This action will change the document status to Archived.`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const result = await archiveDocument(row.id)
    if (result.error) {
      $q.notify({ type: 'negative', message: result.error })
    } else {
      $q.notify({ type: 'positive', message: 'Document archived successfully' })
    }
  })
}

onMounted(() => {
  fetchDocuments()
  fetchStats()
})
</script>

<template>
  <div class="tw:flex tw:flex-col tw:gap-3 tw:h-full tw:p-5">
    <SafeTeleport to="#main-header-title">
      <div class="tw:flex tw:items-center tw:gap-2 tw:text-on-sidebar">
        <WIcon icon="description" class="tw:text-primary" size="24px" />
        <h2 class="tw:text-lg tw:font-bold tw:tracking-tight tw:text-nowrap">Documents</h2>
      </div>
    </SafeTeleport>

    <SafeTeleport to="#main-header-actions">
      <WBtn
        v-if="canCreate"
        label="Create Document"
        icon="add"
        color="primary"
        unelevated
        class="tw:font-medium"
        @click="navigateToCreate"
      />
    </SafeTeleport>

    <!-- Page Header -->
    <div class="tw:flex tw:items-center tw:justify-between">
      <div class="tw:flex tw:flex-col tw:gap-1">
        <div class="tw:text-3xl tw:font-bold tw:text-on-sidebar">Documents</div>
        <div class="tw:text-sm tw:text-secondary">
          Manage controlled documents, versions, and approvals.
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <DocumentsStatsCards :stats="stats" :total="statsTotal" :loading="statsLoading" />

    <!-- Filter Toolbar -->
    <DocumentsFilterToolbar v-model:filters="filters" />

    <!-- Documents Table -->
    <DocumentsTable
      :rows="documents"
      :loading="loading"
      :canUpdate="canUpdate"
      :canArchive="canArchive"
      @view="navigateToDetail"
      @archive="onArchiveDocument"
    />
  </div>
</template>

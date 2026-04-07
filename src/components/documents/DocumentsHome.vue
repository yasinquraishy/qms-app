<script setup>
import { useQuasar } from 'quasar'
import { isAllowed } from '@/utils/currentSession.js'
import { getCompanyPath } from '@/utils/routeHelpers.js'

const router = useRouter()
const $q = useQuasar()

const filters = ref({
  search: '',
  documentTypeId: null,
  documentTemplateId: null,
  departmentId: null,
  statusId: null,
})

const allDocuments = useLiveQueryWithDeps(
  [
    () => filters.value.documentTypeId,
    () => filters.value.documentTemplateId,
    () => filters.value.departmentId,
    () => filters.value.statusId,
  ],
  async (db, [documentTypeId, documentTemplateId, departmentId, statusId]) => {
    let q = db.Document.where()
    if (documentTypeId) q = q.where('documentTypeId', documentTypeId)
    if (documentTemplateId) q = q.where('documentTemplateId', documentTemplateId)
    if (departmentId) q = q.where('departmentId', departmentId)
    if (statusId) q = q.where('statusId', statusId)
    return q.exec()
  },
  { initial: [] },
)

const documents = computed(() => {
  const list = allDocuments.value ?? []
  if (!filters.value.search) return list
  const q = filters.value.search.toLowerCase()
  return list.filter(
    (d) => d.title?.toLowerCase().includes(q) || d.docNumber?.toLowerCase().includes(q),
  )
})

const allDocumentsForStats = useLiveQuery(async (db) => db.Document.where().exec(), {
  initial: [],
})

const stats = computed(() => {
  const list = allDocumentsForStats.value ?? []
  const counts = {}
  for (const d of list) {
    counts[d.statusId] = (counts[d.statusId] || 0) + 1
  }
  return Object.entries(counts).map(([statusId, count]) => ({ statusId, count }))
})

const statsTotal = computed(() => (allDocumentsForStats.value ?? []).length)

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
    row.statusId = 'ARCHIVED'
    await row.save()
    $q.notify({ type: 'positive', message: 'Document archived successfully' })
  })
}
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
    <DocumentsStatsCards :stats="stats" :total="statsTotal" />

    <!-- Filter Toolbar -->
    <DocumentsFilterToolbar v-model:filters="filters" />

    <!-- Documents Table -->
    <DocumentsTable
      :rows="documents"
      :loading="allDocuments === undefined"
      :canUpdate="canUpdate"
      :canArchive="canArchive"
      @view="navigateToDetail"
      @archive="onArchiveDocument"
    />
  </div>
</template>

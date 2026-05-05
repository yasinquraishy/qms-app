<script setup>
import { isAllowed } from '@/utils/currentSession.js'
import { getCompanyPath } from '@/utils/routeHelpers.js'
import { IconFileDescription, IconPlus } from '@tabler/icons-vue'

const router = useRouter()

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

function navigateToCreate() {
  router.push(getCompanyPath('/documents/create'))
}

function navigateToDetail(row) {
  router.push(getCompanyPath(`/documents/${row.id}`))
}
</script>

<template>
  <div class="tw:flex tw:flex-col tw:gap-3 tw:h-full tw:p-5">
    <SafeTeleport to="#main-header-title">
      <div class="tw:flex tw:items-center tw:gap-2 tw:text-on-sidebar">
        <IconFileDescription :size="24" class="tw:text-primary" />
        <h2 class="tw:text-lg tw:font-bold tw:tracking-tight tw:text-nowrap">Documents</h2>
      </div>
    </SafeTeleport>

    <SafeTeleport to="#main-header-actions">
      <BaseButton v-if="canCreate" @click="navigateToCreate">
        <IconPlus :size="16" class="tw:mr-1" />
        Create Document
      </BaseButton>
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
      @view="navigateToDetail"
    />
  </div>
</template>

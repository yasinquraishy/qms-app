<script setup>
import { getCompanyPath } from '@/utils/routeHelpers'
import { currentSession } from '@/utils/currentSession'
import { DateTime } from 'luxon'

const props = defineProps({
  search: { type: String, default: '' },
  statusId: { type: String, default: null },
})

const taskInstances = useLiveQueryWithDeps(
  [() => props.statusId, () => currentSession.value?.userId],
  async (db, [statusId, userId]) => {
    if (!userId) return []
    let results = await db.TaskInstance.where('assignedTo', userId).exec()
    if (statusId) results = results.filter((t) => t.statusId === statusId)
    return results
  },
  { initial: [] },
)

const documentMap = useLiveQueryWithDeps(
  [() => taskInstances.value.map((i) => i.entityId)],
  async (db, [entityIds]) => {
    const ids = [...new Set(entityIds.filter(Boolean))]
    if (!ids.length) return {}
    const documents = await Promise.all(ids.map((id) => db.Document.findByPk(id)))
    return Object.fromEntries(documents.filter(Boolean).map((d) => [d.id, d]))
  },
  { initial: {} },
)

const filteredInstances = computed(() => {
  if (!props.search) return taskInstances.value
  const q = props.search.toLowerCase()
  return taskInstances.value.filter((instance) => {
    const doc = documentMap.value[instance.entityId]
    if (!doc) return false
    return doc.title?.toLowerCase().includes(q) || doc.docNumber?.toLowerCase().includes(q)
  })
})

const columns = [
  { name: 'title', label: 'DOCUMENT', field: 'title', align: 'left' },
  { name: 'type', label: 'TYPE', field: 'type', align: 'left' },
  { name: 'dueDate', label: 'DUE DATE', field: 'dueDate', align: 'left', sortable: true },
  { name: 'status', label: 'STATUS', field: 'status', align: 'left' },
]

function getDocument(instance) {
  return documentMap.value[instance.entityId] || null
}

function isDuePast(dueDate) {
  if (!dueDate) return false
  return dueDate < DateTime.now()
}
</script>

<template>
  <BaseTable :rows="filteredInstances" :columns="columns" rowKey="id">
    <!-- Document Title -->
    <template #body-cell-title="{ row }">
      <RouterLink
        class="tw:flex tw:flex-col tw:group"
        :to="getCompanyPath(`task-instances/${row.id}`)"
      >
        <span class="tw:text-sm tw:font-semibold tw:text-on-main tw:group-hover:text-primary">
          {{ getDocument(row)?.title || '—' }}
        </span>
        <span class="tw:text-[10px] tw:text-secondary tw:font-mono tw:tracking-tight">
          {{ getDocument(row)?.docNumber || '—' }}
        </span>
      </RouterLink>
    </template>

    <!-- Type -->
    <template #body-cell-type="{ row }">
      <DocumentTypeBadgeById
        v-if="getDocument(row)?.documentTypeId"
        :documentTypeId="getDocument(row).documentTypeId"
        :iconOnly="false"
      />
      <span v-else class="tw:text-sm tw:text-secondary">—</span>
    </template>

    <!-- Due Date -->
    <template #body-cell-dueDate="{ row }">
      <span
        class="tw:text-sm tw:font-medium"
        :class="isDuePast(row.dueDate) ? 'tw:text-red-500' : 'tw:text-on-main'"
      >
        {{ row.dueDate ? row.dueDate.formatDate('date') : '—' }}
      </span>
    </template>

    <!-- Status -->
    <template #body-cell-status="{ row }">
      <TaskInstanceStatusBadgeById :statusId="row.statusId" />
    </template>
  </BaseTable>
</template>

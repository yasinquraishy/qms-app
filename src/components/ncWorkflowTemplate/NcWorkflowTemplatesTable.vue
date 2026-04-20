<script setup>
import { IconEdit, IconTrash, IconListDetails } from '@tabler/icons-vue'
import { getCompanyPath } from '@/utils/routeHelpers'
import { isAllowed } from '@/utils/currentSession.js'

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({ search: '', statusId: null }),
  },
})

const router = useRouter()

const canDelete = computed(() => isAllowed(['ncWorkflow:delete']))

const confirmDelete = ref({ open: false, template: null })

const columns = [
  { name: 'name', label: 'TEMPLATE NAME', field: 'name', align: 'left', sortable: true },
  { name: 'stages', label: 'STAGES', field: 'stages', align: 'left', sortable: false },
  { name: 'version', label: 'VERSION', field: 'version', align: 'left', sortable: false },
  { name: 'statusId', label: 'STATUS', field: 'statusId', align: 'left', sortable: false },
  { name: 'createdAt', label: 'CREATED', field: 'createdAt', align: 'left', sortable: true },
  { name: 'actions', label: '', field: 'actions', align: 'right' },
]

const rows = useLiveQueryWithDeps(
  [() => props.filters?.search, () => props.filters?.statusId],
  async (db, [search, statusId]) => {
    let results = await db.NcWorkflowTemplate.where().exec()
    if (statusId) results = results.filter((r) => r.statusId === statusId)
    if (search) {
      const q = search.toLowerCase()
      results = results.filter((r) => r.name.toLowerCase().includes(q))
    }
    return results.sort((a, b) => {
      const ta = b.createdAt?.toMillis?.() ?? 0
      const tb = a.createdAt?.toMillis?.() ?? 0
      return ta - tb
    })
  },
  { initial: [] },
)

const templateMetaMap = useLiveQueryWithDeps(
  [() => rows.value.map((r) => r.id)],
  async (db, [ids]) => {
    if (!ids?.length) return {}
    const versions = await db.NcWorkflowTemplateVersion.where().exec()
    const stages = await db.NcWorkflowTemplateStage.where().exec()
    const map = {}
    for (const id of ids) {
      const templateVersions = versions.filter((v) => v.workflowTemplateId === id)
      const representative = templateVersions.find((v) => v.isCurrent) ?? templateVersions[0]
      if (representative) {
        map[id] = {
          version: representative,
          stageCount: stages.filter((s) => s.versionId === representative.id).length,
        }
      }
    }
    return map
  },
  { initial: {} },
)

function navigate(row) {
  router.push(getCompanyPath(`/nc-workflow-templates/${row.id}`))
}

function handleDelete(template) {
  confirmDelete.value = { open: true, template }
}

async function confirmDeleteTemplate() {
  await confirmDelete.value.template.delete()
  confirmDelete.value = { open: false, template: null }
}

function rowMenuItems(template) {
  const items = [{ name: 'Edit', icon: IconEdit, click: () => navigate(template) }]
  if (canDelete.value) {
    items.push({ name: 'Delete', icon: IconTrash, click: () => handleDelete(template) })
  }
  return items
}
</script>

<template>
  <BaseTable :rows="rows" :columns="columns" rowKey="id">
    <template #body-cell-name="{ row }">
      <div class="tw:flex tw:flex-col tw:cursor-pointer" @click="navigate(row)">
        <span class="tw:font-bold tw:text-on-main">{{ row.name }}</span>
        <span v-if="row.description" class="tw:text-xs tw:text-secondary tw:line-clamp-1">
          {{ row.description }}
        </span>
      </div>
    </template>

    <template #body-cell-stages="{ row }">
      <div class="tw:flex tw:items-center tw:gap-1">
        <IconListDetails :size="16" class="tw:text-secondary" />
        <span class="tw:text-sm tw:text-secondary">
          {{ templateMetaMap[row.id]?.stageCount ?? 0 }} Stages
        </span>
      </div>
    </template>

    <template #body-cell-version="{ row }">
      <span class="tw:text-sm tw:text-secondary tw:font-mono">
        v{{
          templateMetaMap[row.id]?.version?.versionLabel ||
          `${templateMetaMap[row.id]?.version?.versionMajor ?? 1}.${templateMetaMap[row.id]?.version?.versionMinor ?? 0}`
        }}
      </span>
    </template>

    <template #body-cell-statusId="{ row }">
      <NcWorkflowTemplateVersionStatusBadgeById
        :statusId="templateMetaMap[row.id]?.version?.statusId"
        showDot
      />
    </template>

    <template #body-cell-createdAt="{ row }">
      <span class="tw:text-sm tw:text-secondary">
        {{ row.createdAt?.formatDate('date') }}
      </span>
    </template>

    <template #body-cell-actions="{ row }">
      <div class="tw:flex tw:justify-end">
        <BaseMenu :items="rowMenuItems(row)" />
      </div>
    </template>
  </BaseTable>

  <ConfirmDialog
    v-model="confirmDelete.open"
    title="Delete Template"
    :message="`Are you sure you want to delete '${confirmDelete.template?.name}'? This cannot be undone.`"
    okLabel="Delete"
    @ok="confirmDeleteTemplate"
  />
</template>

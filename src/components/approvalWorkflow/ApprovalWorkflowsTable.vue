<script setup>
import { IconEdit, IconTrash, IconGitBranch } from '@tabler/icons-vue'
import { getCompanyPath } from '@/utils/routeHelpers'
import { isAllowed } from '@/utils/currentSession.js'

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({ search: '', statusId: null }),
  },
})

const router = useRouter()

const canDeleteWorkflow = computed(() => isAllowed(['approvalWorkflows:delete']))

const confirmDelete = ref({ open: false, workflow: null })

const columns = [
  { name: 'name', label: 'WORKFLOW NAME', field: 'name', align: 'left', sortable: true },
  { name: 'steps', label: 'STEPS', field: 'steps', align: 'left', sortable: false },
  { name: 'version', label: 'VERSION', field: 'version', align: 'left', sortable: false },
  { name: 'statusId', label: 'STATUS', field: 'statusId', align: 'left', sortable: false },
  { name: 'createdAt', label: 'CREATED', field: 'createdAt', align: 'left', sortable: true },
  { name: 'actions', label: '', field: 'actions', align: 'right' },
]

const rows = useLiveQueryWithDeps(
  [() => props.filters?.search, () => props.filters?.statusId],
  async (db, [search, statusId]) => {
    let results = await db.ApprovalWorkflow.where().exec()
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

const workflowMetaMap = useLiveQueryWithDeps(
  [() => rows.value.map((r) => r.id)],
  async (db, [ids]) => {
    if (!ids?.length) return {}
    const versions = await db.ApprovalWorkflowVersion.where().exec()
    const current = versions.filter((v) => v.isCurrent && ids.includes(v.workflowId))
    const steps = await db.ApprovalWorkflowStep.where().exec()
    const map = {}
    for (const v of current) {
      map[v.workflowId] = {
        version: v,
        stepCount: steps.filter((s) => s.workflowVersionId === v.id).length,
      }
    }
    return map
  },
  { initial: {} },
)

function navigateToWorkflow(row) {
  router.push(getCompanyPath(`/approval-workflows/${row.id}`))
}

function handleDelete(workflow) {
  confirmDelete.value = { open: true, workflow }
}

async function confirmDeleteWorkflow() {
  await confirmDelete.value.workflow.delete()
  confirmDelete.value = { open: false, workflow: null }
}

function rowMenuItems(workflow) {
  const items = [{ name: 'Edit', icon: IconEdit, click: () => navigateToWorkflow(workflow) }]
  if (canDeleteWorkflow.value) {
    items.push({ name: 'Delete', icon: IconTrash, click: () => handleDelete(workflow) })
  }
  return items
}
</script>

<template>
  <BaseTable :rows="rows" :columns="columns" rowKey="id">
    <template #body-cell-name="{ row }">
      <div class="tw:flex tw:flex-col tw:cursor-pointer" @click="navigateToWorkflow(row)">
        <span class="tw:font-bold tw:text-on-main">{{ row.name }}</span>
        <span v-if="row.description" class="tw:text-xs tw:text-secondary tw:line-clamp-1">
          {{ row.description }}
        </span>
      </div>
    </template>

    <template #body-cell-steps="{ row }">
      <div class="tw:flex tw:items-center tw:gap-1">
        <IconGitBranch :size="16" class="tw:text-secondary" />
        <span class="tw:text-sm tw:text-secondary">
          {{ workflowMetaMap[row.id]?.stepCount ?? 0 }} Steps
        </span>
      </div>
    </template>

    <template #body-cell-version="{ row }">
      <span class="tw:text-sm tw:text-secondary tw:font-mono">
        v{{
          workflowMetaMap[row.id]?.version?.versionLabel ||
          `${workflowMetaMap[row.id]?.version?.versionMajor ?? 1}.${workflowMetaMap[row.id]?.version?.versionMinor ?? 0}`
        }}
      </span>
    </template>

    <template #body-cell-statusId="{ row }">
      <ApprovalWorkflowStatusBadge :status="workflowMetaMap[row.id]?.version?.statusId" showDot />
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
    title="Delete Workflow"
    :message="`Are you sure you want to delete '${confirmDelete.workflow?.name}'? This cannot be undone.`"
    okLabel="Delete"
    @ok="confirmDeleteWorkflow"
  />
</template>

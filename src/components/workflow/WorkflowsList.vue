<script setup>
import { getCompanyPath } from '@/utils/routeHelpers'

const props = defineProps({
  filters: { type: Object, default: () => ({ search: '', statusId: null }) },
})

const router = useRouter()

const workflows = useLiveQuery(
  async (db) => {
    const all = await db.Workflow.where().exec()
    return all
  },
  { initial: [] },
)

const filteredWorkflows = computed(() => {
  let rows = workflows.value || []
  if (props.filters?.search) {
    const q = props.filters.search.toLowerCase()
    rows = rows.filter((w) => w.name?.toLowerCase().includes(q))
  }
  if (props.filters?.statusId) {
    rows = rows.filter((w) => w.statusId === props.filters.statusId)
  }
  return rows
})

function navigateToWorkflow(workflow) {
  const path = getCompanyPath(`/workflow-templates/${workflow.id}`)
  router.push(path)
}
</script>

<template>
  <div
    class="tw:p-6 tw:grid tw:grid-cols-1 tw:md:grid-cols-2 tw:lg:grid-cols-3 tw:gap-4 tw:auto-rows-min"
  >
    <div v-if="!workflows" class="tw:col-span-3 tw:flex tw:items-center tw:justify-center tw:py-12">
      <div
        class="tw:w-8 tw:h-8 tw:border-2 tw:border-primary tw:border-t-transparent tw:rounded-full tw:animate-spin"
      />
    </div>

    <BaseEmptyState
      v-else-if="filteredWorkflows.length === 0"
      class="tw:col-span-3"
      title="No workflows found"
      description="Create your first approval workflow to get started."
    />

    <!-- Workflow Cards -->
    <WorkflowCard
      v-for="workflow in filteredWorkflows"
      :key="workflow.id"
      :workflow="workflow"
      @click="navigateToWorkflow(workflow)"
    />
  </div>
</template>

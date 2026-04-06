<script setup>
import { useApprovalWorkflows } from '@/composables/useApprovalWorkflows.js'
import { getCompanyPath } from '@/utils/routeHelpers'
import { useCompanyLocalStorage } from '@/utils/useCompanyLocalStorage'
import { isAllowed } from '@/utils/currentSession.js'

const router = useRouter()

const showCreateDialog = ref(false)
const viewMode = useCompanyLocalStorage('approval-workflows-view-mode', 'table')

const canCreateWorkflow = computed(() => isAllowed(['approvalWorkflows:create']))

const { filters } = useApprovalWorkflows()

const viewSwitches = [
  { icon: 'view_agenda', value: 'list', tooltip: 'List View' },
  { icon: 'table_rows', value: 'table', tooltip: 'Table View' },
]

function handleWorkflowCreated(workflow) {
  const path = getCompanyPath(`/approval-workflows/${workflow.id}`)
  router.push(path)
}
</script>

<template>
  <div class="tw:flex tw:flex-col tw:gap-3 tw:h-full tw:p-5">
    <SafeTeleport to="#main-header-title">
      <div class="tw:flex tw:items-center tw:gap-2 tw:text-on-sidebar">
        <WIcon icon="account_tree" class="tw:text-primary" size="24px" />
        <h2 class="tw:text-lg tw:font-bold tw:tracking-tight tw:text-nowrap">Approval Workflows</h2>
      </div>
    </SafeTeleport>

    <SafeTeleport to="#main-header-actions">
      <WBtn
        v-if="canCreateWorkflow"
        label="Create Workflow"
        icon="add"
        color="primary"
        unelevated
        class="tw:font-medium"
        @click="showCreateDialog = true"
      />
    </SafeTeleport>

    <!-- Page Header -->
    <div class="tw:flex tw:items-center tw:justify-between">
      <div class="tw:flex tw:flex-col tw:gap-1">
        <div class="tw:text-3xl tw:font-bold tw:text-on-sidebar">Approval Workflows</div>
        <div class="tw:text-sm tw:text-secondary">
          Design and manage multi-step approval sequences for documents and records.
        </div>
      </div>
    </div>

    <ApprovalWorkflowsFilterToolbar v-model:filters="filters">
      <template #actions>
        <WSwitcher v-model="viewMode" :switches="viewSwitches" />
      </template>
    </ApprovalWorkflowsFilterToolbar>

    <!-- Content Views -->
    <ApprovalWorkflowsTable v-if="viewMode === 'table'" />
    <div v-else class="tw:flex-1 tw:overflow-y-auto">
      <ApprovalWorkflowsList />
    </div>
  </div>

  <!-- Create Dialog -->
  <ApprovalWorkflowCreateDialog v-model="showCreateDialog" @created="handleWorkflowCreated" />
</template>

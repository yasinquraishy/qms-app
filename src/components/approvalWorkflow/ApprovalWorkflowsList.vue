<script setup>
import { useApprovalWorkflows } from '@/composables/useApprovalWorkflows.js'
import { getCompanyPath } from '@/utils/routeHelpers'

const router = useRouter()
const { workflows, loading } = useApprovalWorkflows()

function navigateToWorkflow(workflow) {
  const path = getCompanyPath(`/approval-workflows/${workflow.id}`)
  router.push(path)
}
</script>

<template>
  <div class="tw:flex-1 tw:overflow-y-auto tw:space-y-4">
    <div v-if="loading" class="tw:flex tw:items-center tw:justify-center tw:py-12">
      <QSpinner color="primary" size="48px" />
    </div>

    <WEmptyState
      v-else-if="workflows.length === 0"
      icon="account_tree"
      title="No workflows found"
      description="Create your first approval workflow to get started."
    />

    <!-- Workflow Cards -->
    <ApprovalWorkflowCard
      v-for="workflow in workflows"
      :key="workflow.id"
      :workflow="workflow"
      @click="navigateToWorkflow(workflow)"
    />
  </div>
</template>

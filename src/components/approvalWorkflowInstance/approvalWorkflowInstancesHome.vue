<script setup>
import { provideApprovalWorkflowInstances } from '@/composables/useApprovalWorkflowInstances.js'

const { filters, fetchInstances } = provideApprovalWorkflowInstances()

onMounted(() => fetchInstances())
</script>

<template>
  <div class="tw:flex tw:flex-col tw:gap-3 tw:h-full tw:p-5">
    <!-- Header teleports -->
    <SafeTeleport to="#main-header-title">
      <div>
        <div class="tw:text-xl tw:font-bold tw:text-on-main">Approvals Inbox</div>
        <div class="tw:text-xs tw:text-secondary tw:hidden tw:sm:block">
          Review and authorize pending quality management tasks.
        </div>
      </div>
    </SafeTeleport>

    <!-- Filter toolbar -->
    <ApprovalWorkflowInstancesFilterToolbar v-model:filters="filters" />

    <!-- Split-view layout -->
    <div class="tw:flex tw:gap-4 tw:flex-1 tw:min-h-0">
      <!-- Table -->
      <div class="tw:flex-1 tw:min-w-0 tw:flex tw:flex-col">
        <ApprovalWorkflowInstancesTable />
      </div>
    </div>
  </div>
</template>

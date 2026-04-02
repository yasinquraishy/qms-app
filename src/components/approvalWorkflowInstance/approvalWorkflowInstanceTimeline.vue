<script setup>
defineProps({
  steps: { type: Array, default: () => [] },
})

function stepState(step) {
  const statusName = step.statusId
  if (statusName === 'APPROVED') return 'completed'
  if (statusName === 'IN_PROGRESS') return 'active'
  if (statusName === 'REJECTED') return 'rejected'
  if (statusName === 'CHANGES_REQUESTED') return 'changesRequested'
  return 'pending'
}
</script>

<template>
  <div class="tw:space-y-4">
    <h2 class="tw:text-lg tw:font-bold tw:text-on-main tw:px-1">Approval Workflow</h2>

    <div v-for="(stepEntry, idx) in steps" :key="stepEntry.id" class="tw:relative tw:pl-8 tw:group">
      <!-- Vertical connector line -->
      <div
        v-if="idx < steps.length - 1"
        class="tw:absolute tw:left-2.75 tw:top-6 tw:bottom-0 tw:w-0.5 tw:bg-divider"
      ></div>

      <!-- Completed step icon -->
      <div
        v-if="stepState(stepEntry) === 'completed'"
        class="tw:absolute tw:left-0 tw:top-6 tw:size-6 tw:rounded-full tw:bg-emerald-500 tw:flex tw:items-center tw:justify-center tw:text-white tw:z-10"
      >
        <WIcon name="check" size="14px" />
      </div>

      <!-- Active step icon -->
      <div
        v-else-if="stepState(stepEntry) === 'active'"
        class="tw:absolute tw:left-0 tw:top-6 tw:size-6 tw:rounded-full tw:bg-primary tw:flex tw:items-center tw:justify-center tw:text-white tw:z-10 tw:shadow-[0_0_10px_rgba(19,109,236,0.3)]"
      >
        <WIcon name="hourglass_empty" size="14px" />
      </div>

      <!-- Rejected step icon -->
      <div
        v-else-if="stepState(stepEntry) === 'rejected'"
        class="tw:absolute tw:left-0 tw:top-6 tw:size-6 tw:rounded-full tw:bg-red-500 tw:flex tw:items-center tw:justify-center tw:text-white tw:z-10"
      >
        <WIcon name="close" size="14px" />
      </div>

      <!-- Changes Requested step icon -->
      <div
        v-else-if="stepState(stepEntry) === 'changesRequested'"
        class="tw:absolute tw:left-0 tw:top-6 tw:size-6 tw:rounded-full tw:bg-orange-500 tw:flex tw:items-center tw:justify-center tw:text-white tw:z-10"
      >
        <WIcon name="edit_note" size="14px" />
      </div>

      <!-- Pending step icon -->
      <div
        v-else
        class="tw:absolute tw:left-0 tw:top-6 tw:size-6 tw:rounded-full tw:bg-main tw:border-2 tw:border-divider tw:flex tw:items-center tw:justify-center tw:text-secondary tw:z-10"
      >
        <WIcon name="lock" size="14px" />
      </div>

      <!-- Step cards -->
      <ApprovalWorkflowInstanceStepCompleted
        v-if="stepState(stepEntry) === 'completed'"
        :stepEntry="stepEntry"
      />
      <ApprovalWorkflowInstanceStepActive
        v-else-if="stepState(stepEntry) === 'active'"
        :stepEntry="stepEntry"
      />
      <ApprovalWorkflowInstanceStepRejected
        v-else-if="stepState(stepEntry) === 'rejected'"
        :stepEntry="stepEntry"
      />
      <ApprovalWorkflowInstanceStepRejected
        v-else-if="stepState(stepEntry) === 'changesRequested'"
        :stepEntry="stepEntry"
      />
      <ApprovalWorkflowInstanceStepPending v-else :stepEntry="stepEntry" />
    </div>
  </div>
</template>

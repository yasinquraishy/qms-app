<script setup>
import {
  IconCheck,
  IconHourglass,
  IconX,
  IconPencil,
  IconLock,
  IconBinaryTree,
} from '@tabler/icons-vue'

const props = defineProps({
  workflowInstanceId: { type: String, default: null },
})

const steps = useLiveQueryWithDeps(
  [() => props.workflowInstanceId],
  async (db, [workflowInstanceId]) => {
    if (!workflowInstanceId) return []
    return db.WorkflowInstanceStep.where('workflowInstanceId', workflowInstanceId)
      .orderBy('stepNumber', 'asc')
      .exec()
  },
)

const loading = computed(() => steps.value === undefined)

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

    <div v-if="loading" class="tw:flex tw:justify-center tw:py-12">
      <div
        class="tw:animate-spin tw:rounded-full tw:h-8 tw:w-8 tw:border-2 tw:border-primary tw:border-t-transparent"
      />
    </div>

    <div
      v-else-if="!steps.length"
      class="tw:flex tw:flex-col tw:items-center tw:justify-center tw:py-12 tw:text-secondary tw:gap-3"
    >
      <IconBinaryTree :size="40" class="tw:opacity-30" />
      <p class="tw:text-sm tw:font-medium">No workflow data available</p>
    </div>

    <template v-else>
      <div
        v-for="(stepEntry, idx) in steps"
        :key="stepEntry.id"
        class="tw:relative tw:pl-8 tw:group"
      >
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
          <IconCheck :size="14" />
        </div>

        <!-- Active step icon -->
        <div
          v-else-if="stepState(stepEntry) === 'active'"
          class="tw:absolute tw:left-0 tw:top-6 tw:size-6 tw:rounded-full tw:bg-primary tw:flex tw:items-center tw:justify-center tw:text-white tw:z-10 tw:shadow-[0_0_10px_rgba(19,109,236,0.3)]"
        >
          <IconHourglass :size="14" />
        </div>

        <!-- Rejected step icon -->
        <div
          v-else-if="stepState(stepEntry) === 'rejected'"
          class="tw:absolute tw:left-0 tw:top-6 tw:size-6 tw:rounded-full tw:bg-red-500 tw:flex tw:items-center tw:justify-center tw:text-white tw:z-10"
        >
          <IconX :size="14" />
        </div>

        <!-- Changes Requested step icon -->
        <div
          v-else-if="stepState(stepEntry) === 'changesRequested'"
          class="tw:absolute tw:left-0 tw:top-6 tw:size-6 tw:rounded-full tw:bg-orange-500 tw:flex tw:items-center tw:justify-center tw:text-white tw:z-10"
        >
          <IconPencil :size="14" />
        </div>

        <!-- Pending step icon -->
        <div
          v-else
          class="tw:absolute tw:left-0 tw:top-6 tw:size-6 tw:rounded-full tw:bg-main tw:border-2 tw:border-divider tw:flex tw:items-center tw:justify-center tw:text-secondary tw:z-10"
        >
          <IconLock :size="14" />
        </div>

        <!-- Step cards -->
        <WorkflowInstanceStepCompleted
          v-if="stepState(stepEntry) === 'completed'"
          :instanceStepId="stepEntry.id"
        />
        <WorkflowInstanceStepActive
          v-else-if="stepState(stepEntry) === 'active'"
          :instanceStepId="stepEntry.id"
        />
        <WorkflowInstanceStepRejected
          v-else-if="stepState(stepEntry) === 'rejected'"
          :instanceStepId="stepEntry.id"
        />
        <WorkflowInstanceStepRejected
          v-else-if="stepState(stepEntry) === 'changesRequested'"
          :instanceStepId="stepEntry.id"
        />
        <WorkflowInstanceStepPending v-else :instanceStepId="stepEntry.id" />
      </div>
    </template>
  </div>
</template>

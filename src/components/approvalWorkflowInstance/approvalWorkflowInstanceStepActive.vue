<script setup>
import { currentSession } from '@/utils/currentSession.js'

defineProps({
  stepEntry: { type: Object, required: true },
})

const currentUserId = computed(() => currentSession.value?.id)

function isCurrentUser(task) {
  return task.assignee?.id === currentUserId.value
}

function approvedCount(step) {
  return (step.tasks || []).filter((t) => t.statusId === 'APPROVED').length
}

function canActOnStep(step) {
  const assignment = step.tasks?.find((t) => t.assignedTo === currentUserId.value)
  return assignment && assignment.statusId === 'ASSIGNED'
}
</script>

<template>
  <div
    class="tw:bg-sidebar tw:rounded-xl tw:border-2 tw:border-primary tw:p-5 tw:shadow-lg tw:shadow-primary/5"
  >
    <div
      class="tw:flex tw:flex-col tw:md:flex-row tw:md:items-center tw:justify-between tw:gap-4 tw:mb-6"
    >
      <div>
        <h3 class="tw:font-bold tw:text-on-main tw:flex tw:items-center tw:gap-2">
          Step {{ stepEntry.stepNumber }}: {{ stepEntry.step?.name }}
          <WStatusBadge :status="stepEntry.statusId" variant="step" />
        </h3>
        <p class="tw:text-xs tw:text-secondary">
          Rule: {{ stepEntry.step?.approvalRule }} approvers must sign &bull;
          <span class="tw:text-primary tw:font-medium">
            {{ approvedCount(stepEntry) }} of {{ stepEntry.tasks?.length || 0 }} approved
          </span>
        </p>
      </div>
      <!-- Avatar stack -->
      <div class="tw:flex tw:-space-x-3 tw:overflow-hidden">
        <UserAvatar
          v-for="task in stepEntry.tasks"
          :key="task.id"
          :user="task.assignee"
          class="tw:size-8"
          :class="
            task.statusId === 'APPROVED'
              ? 'tw:border-emerald-500'
              : 'tw:border-divider tw:grayscale tw:opacity-50'
          "
        />
      </div>
    </div>

    <!-- Approver list -->
    <div class="tw:space-y-4 tw:mb-8">
      <div
        v-for="task in stepEntry.tasks"
        :key="task.id"
        class="tw:flex tw:items-center tw:justify-between tw:p-3 tw:rounded-lg tw:border"
        :class="{
          'tw:bg-emerald-50/50 tw:border-emerald-200': task.statusId === 'APPROVED',
          'tw:bg-sidebar tw:border-divider tw:ring-2 tw:ring-primary/20':
            isCurrentUser(task) && task.statusId === 'ASSIGNED',
          'tw:bg-sidebar tw:border-divider tw:opacity-60':
            !isCurrentUser(task) && task.statusId !== 'APPROVED',
        }"
      >
        <div class="tw:flex tw:items-center tw:gap-3">
          <div class="tw:relative">
            <UserAvatar
              :user="task.assignee"
              class="tw:size-10"
              :class="
                task.statusId === 'APPROVED'
                  ? 'tw:border-emerald-500'
                  : 'tw:border-divider tw:grayscale tw:opacity-50'
              "
            />

            <!-- Status indicator dot -->
            <div class="tw:absolute tw:-bottom-1 tw:-right-1">
              <WStatusBadge :status="task.statusId" variant="task" showDot hideLabel />
            </div>
          </div>
          <div>
            <p class="tw:text-sm tw:font-semibold tw:text-on-main">
              {{ task.assignee?.firstName }} {{ task.assignee?.lastName }}
              <span v-if="isCurrentUser(task)" class="tw:text-primary">(You)</span>
            </p>
            <p class="ds-label-sm tw:text-secondary">
              {{ task.assignee?.email }}
            </p>
          </div>
        </div>
        <WStatusBadge :status="task.statusId" variant="task" />
      </div>
    </div>

    <!-- Action buttons (only for current user with PENDING status) -->
    <div
      v-if="canActOnStep(stepEntry)"
      class="tw:bg-primary/5 tw:rounded-xl tw:p-4 tw:border tw:border-primary/20"
    >
      <div class="tw:flex tw:flex-col tw:gap-4">
        <div class="tw:flex tw:items-center tw:gap-2 tw:mb-2">
          <WIcon name="draw" size="20px" class="tw:text-primary" />
          <p class="tw:text-sm tw:font-semibold tw:text-primary">Your required action</p>
        </div>
        <div class="tw:flex tw:flex-wrap tw:gap-3">
          <ApprovalWorkflowInstanceApproverAction action="APPROVE" :activeStep="stepEntry" />
          <ApprovalWorkflowInstanceApproverAction action="REJECT" :activeStep="stepEntry" />
        </div>
      </div>
    </div>
  </div>
</template>

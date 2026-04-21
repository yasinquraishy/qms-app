<script setup>
import { IconSignature } from '@tabler/icons-vue'
import { currentSession } from '@/utils/currentSession.js'

const props = defineProps({
  instanceStepId: { type: String, required: true },
})

const currentUserId = computed(() => currentSession.value?.id)

const instanceStep = useLiveQueryWithDeps(
  [() => props.instanceStepId],
  async (db, [instanceStepId]) => {
    if (!instanceStepId) return null
    return db.WorkflowInstanceStep.findByPk(instanceStepId)
  },
)

const step = useLiveQueryWithDeps([() => instanceStep.value?.stepId], async (db, [stepId]) => {
  if (!stepId) return null
  return db.WorkflowStage.findByPk(stepId)
})

const tasks = useLiveQueryWithDeps(
  [() => props.instanceStepId],
  async (db, [instanceStepId]) => {
    if (!instanceStepId) return []
    return db.TaskInstance.where('[sourceType+sourceId]', [
      'WorkflowInstanceStep',
      instanceStepId,
    ]).exec()
  },
  { initial: [] },
)

function isCurrentUser(task) {
  return task.assignedTo === currentUserId.value
}

const approvedCount = computed(() => tasks.value.filter((t) => t.statusId === 'APPROVED').length)

const myTask = computed(() =>
  tasks.value.find((t) => t.assignedTo === currentUserId.value && t.statusId === 'ASSIGNED'),
)

const usersMap = useLiveQueryWithDeps(
  [() => tasks.value.map((t) => t.assignedTo)],
  async (db, [userIds]) => {
    const ids = [...new Set(userIds.filter(Boolean))]
    if (!ids.length) return {}
    const users = await Promise.all(ids.map((id) => db.User.findByPk(id)))
    return Object.fromEntries(users.filter(Boolean).map((u) => [u.id, u]))
  },
  { initial: {} },
)
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
          Step {{ instanceStep?.stepNumber }}: {{ step?.name }}
          <WorkflowInstanceStepStatusBadgeById :statusId="instanceStep?.statusId" />
        </h3>
        <p class="tw:text-xs tw:text-secondary">
          Rule: {{ step?.approvalRule }} approvers must sign &bull;
          <span class="tw:text-primary tw:font-medium">
            {{ approvedCount }} of {{ tasks.length }} approved
          </span>
        </p>
      </div>
      <!-- Avatar stack -->
      <div class="tw:flex tw:-space-x-3 tw:overflow-hidden">
        <UserAvatarById
          v-for="task in tasks"
          :key="task.id"
          :userId="task.assignedTo"
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
        v-for="task in tasks"
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
            <UserAvatarById
              :userId="task.assignedTo"
              class="tw:size-10"
              :class="
                task.statusId === 'APPROVED'
                  ? 'tw:border-emerald-500'
                  : 'tw:border-divider tw:grayscale tw:opacity-50'
              "
            />
          </div>
          <div>
            <p class="tw:text-sm tw:font-semibold tw:text-on-main">
              {{ usersMap[task.assignedTo]?.firstName }} {{ usersMap[task.assignedTo]?.lastName }}
              <span v-if="isCurrentUser(task)" class="tw:text-primary">(You)</span>
            </p>
            <p class="ds-label-sm tw:text-secondary">{{ usersMap[task.assignedTo]?.email }}</p>
          </div>
        </div>
        <TaskInstanceStatusBadgeById :statusId="task.statusId" />
      </div>
    </div>

    <!-- Action buttons (only for current user with ASSIGNED status) -->
    <div v-if="myTask" class="tw:bg-primary/5 tw:rounded-xl tw:p-4 tw:border tw:border-primary/20">
      <div class="tw:flex tw:flex-col tw:gap-4">
        <div class="tw:flex tw:items-center tw:gap-2 tw:mb-2">
          <IconSignature :size="20" class="tw:text-primary" />
          <p class="tw:text-sm tw:font-semibold tw:text-primary">Your required action</p>
        </div>
        <div class="tw:flex tw:flex-wrap tw:gap-3">
          <WorkflowInstanceApproverAction
            action="APPROVE"
            :workflowInstanceId="instanceStep?.workflowInstanceId"
            :instanceStepId="instanceStepId"
          />
          <WorkflowInstanceApproverAction
            action="REJECT"
            :workflowInstanceId="instanceStep?.workflowInstanceId"
            :instanceStepId="instanceStepId"
          />
        </div>
      </div>
    </div>
  </div>
</template>

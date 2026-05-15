<script setup>
const props = defineProps({
  instanceStepId: { type: String, required: true },
  capaId: { type: String, required: true },
})

const instanceStep = useLiveQueryWithDeps([() => props.instanceStepId], async (db, [id]) =>
  id ? db.WorkflowInstanceStep.findByPk(id) : null,
)

const stepDefinition = useLiveQueryWithDeps(
  [() => instanceStep.value?.stepId],
  async (db, [stepId]) => (stepId ? db.WorkflowStep.findByPk(stepId) : null),
)

const assignments = useLiveQueryWithDeps(
  [() => props.instanceStepId],
  async (db, [id]) => {
    if (!id) return []
    return db.UserOnWorkflowInstanceStep.where('workflowInstanceStepId', id).exec()
  },
  { initial: [] },
)

const assigneeUsers = useLiveQueryWithDeps(
  [() => assignments.value.map((a) => a.userId).join(',')],
  async (db, [userIdsStr]) => {
    if (!userIdsStr) return {}
    const userIds = [...new Set(userIdsStr.split(','))]
    const users = await Promise.all(userIds.map((id) => db.User.findByPk(id)))
    return Object.fromEntries(users.filter(Boolean).map((u) => [u.id, u]))
  },
  { initial: {} },
)

function getUserName(userId) {
  const u = assigneeUsers.value[userId]
  if (!u) return '—'
  return [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email
}

function getUserEmail(userId) {
  return assigneeUsers.value[userId]?.email || '—'
}

function getStepStatusClass(statusId) {
  return {
    'tw:bg-blue-100 tw:text-blue-700': statusId === 'IN_PROGRESS',
    'tw:bg-gray-100 tw:text-gray-600': statusId === 'PENDING',
    'tw:bg-green-100 tw:text-green-700': statusId === 'APPROVED',
    'tw:bg-red-100 tw:text-red-700': statusId === 'CANCELLED',
    'tw:bg-orange-100 tw:text-orange-700': statusId === 'SENT_BACK',
  }
}

function getUserStatusClass(statusId) {
  return {
    'tw:bg-gray-100 tw:text-gray-600': statusId === 'PENDING',
    'tw:bg-blue-100 tw:text-blue-700': statusId === 'ASSIGNED',
    'tw:bg-green-100 tw:text-green-700': statusId === 'APPROVED',
    'tw:bg-red-100 tw:text-red-700': statusId === 'REJECTED',
    'tw:bg-orange-100 tw:text-orange-700': statusId === 'REASSIGNED',
    'tw:bg-yellow-100 tw:text-yellow-700': statusId === 'CANCELLED',
  }
}

function getStatusLabel(statusId) {
  if (!statusId) return '—'
  if (statusId === 'APPROVED') return 'Completed'
  return statusId.replace('_', ' ')
}

// CAPA nested stages: whether this step has children (drives form vs. sub-step list).
const childStepCount = useLiveQueryWithDeps(
  [() => stepDefinition.value?.id],
  async (db, [parentId]) => {
    if (!parentId) return 0
    const children = await db.WorkflowStep.where('parentStepId', parentId).exec()
    return children.length
  },
  { initial: 0 },
)

const hasChildren = computed(() => childStepCount.value > 0)
</script>

<template>
  <div v-if="instanceStep" class="tw:bg-white tw:border tw:border-divider tw:rounded-lg tw:p-5">
    <div
      class="tw:flex tw:flex-wrap tw:items-center tw:gap-2 tw:pb-3 tw:border-b tw:border-divider tw:mb-4"
    >
      <span class="tw:text-xs tw:font-semibold tw:text-secondary tw:uppercase tw:tracking-wider">
        {{ instanceStep.stepNumber }}. {{ stepDefinition?.name || 'Step' }}
      </span>
      <BaseBadge class="tw:text-[10px]" :class="getStepStatusClass(instanceStep.statusId)">
        {{ getStatusLabel(instanceStep.statusId) }}
      </BaseBadge>
    </div>

    <!-- Sub-tasks list (parent stages with nested children) -->
    <CapaWorkflowChildSteps
      v-if="hasChildren && stepDefinition?.id && instanceStep.workflowInstanceId"
      :parentStepId="stepDefinition.id"
      :workflowInstanceId="instanceStep.workflowInstanceId"
      :capaId="capaId"
      class="tw:mb-4"
    />

    <!-- Assignees list -->
    <div class="tw:mb-4">
      <div class="tw:text-[11px] tw:text-secondary tw:font-medium tw:mb-2">Assignees</div>
      <div v-if="assignments.length" class="tw:flex tw:flex-col tw:gap-2">
        <div
          v-for="assignment in assignments"
          :key="assignment.id"
          class="tw:flex tw:items-center tw:gap-2"
        >
          <UserAvatarById :userId="assignment.userId" class="tw:size-8" />
          <div class="tw:flex tw:flex-col tw:gap-1 tw:min-w-0">
            <div>
              <span class="tw:text-xs tw:text-on-main tw:font-medium">
                {{ getUserName(assignment.userId) }}
              </span>
              <span
                class="tw:text-[9px] tw:px-1.5 tw:py-0.5 tw:rounded tw:font-medium tw:shrink-0 tw:ml-1"
                :class="getUserStatusClass(assignment.statusId)"
              >
                {{ getStatusLabel(assignment.statusId) }}
              </span>
            </div>
            <span class="tw:text-xs tw:text-secondary tw:truncate">
              {{ getUserEmail(assignment.userId) }}
            </span>
          </div>
        </div>
      </div>
      <span v-else class="tw:text-sm tw:text-secondary">—</span>
    </div>

    <CapaWorkflowStepForm :instanceStepId="instanceStepId" :capaId="capaId" />
  </div>
</template>

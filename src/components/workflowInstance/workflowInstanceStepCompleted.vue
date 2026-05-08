<script setup>
const props = defineProps({
  instanceStepId: { type: String, required: true },
})

const instanceStep = useLiveQueryWithDeps(
  [() => props.instanceStepId],
  async (db, [instanceStepId]) => {
    if (!instanceStepId) return null
    return db.WorkflowInstanceStep.findByPk(instanceStepId)
  },
)

const step = useLiveQueryWithDeps([() => instanceStep.value?.stepId], async (db, [stepId]) => {
  if (!stepId) return null
  return db.WorkflowStep.findByPk(stepId)
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
    class="tw:bg-sidebar tw:rounded-xl tw:border tw:border-divider tw:p-5 tw:shadow-sm tw:opacity-80 tw:hover:opacity-100 tw:transition-opacity"
  >
    <div class="tw:flex tw:items-center tw:justify-between tw:mb-4">
      <div>
        <h3 class="tw:font-bold tw:text-on-main">
          Step {{ instanceStep?.stepNumber }}: {{ step?.name }}
        </h3>
        <p class="tw:text-xs tw:text-secondary">
          Rule: {{ step?.approvalRule }} &bull; Threshold met
        </p>
      </div>
      <WorkflowInstanceStepStatusBadgeById :statusId="instanceStep?.statusId" />
    </div>
    <div class="tw:space-y-2">
      <div v-for="task in tasks" :key="task.id" class="tw:flex tw:items-center tw:gap-3">
        <UserAvatarById :userId="task.assignedTo" class="tw:size-8" />
        <div>
          <p class="tw:text-sm tw:font-semibold tw:text-on-main">
            {{ usersMap[task.assignedTo]?.firstName }} {{ usersMap[task.assignedTo]?.lastName }}
          </p>
          <TaskInstanceStatusBadgeById :statusId="task.statusId" />
        </div>
      </div>
    </div>
  </div>
</template>

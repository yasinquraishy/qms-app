<script setup>
const props = defineProps({
  parentStepId: { type: String, required: true },
  workflowInstanceId: { type: String, required: true },
})

const childStepDefs = useLiveQueryWithDeps(
  [() => props.parentStepId],
  async (db, [parentId]) => {
    if (!parentId) return []
    return db.WorkflowStep.where('parentStepId', parentId).orderBy('stepOrder').exec()
  },
  { initial: [] },
)

const childInstanceSteps = useLiveQueryWithDeps(
  [() => props.workflowInstanceId, () => childStepDefs.value.map((s) => s.id).join(',')],
  async (db, [workflowInstanceId, idsStr]) => {
    if (!workflowInstanceId || !idsStr) return []
    const childStepIds = new Set(idsStr.split(','))
    const all = await db.WorkflowInstanceStep.where('workflowInstanceId', workflowInstanceId).exec()
    const latest = new Map()
    for (const s of all) {
      if (!childStepIds.has(s.stepId)) continue
      const existing = latest.get(s.stepId)
      if (!existing || s.createdAt > existing.createdAt) latest.set(s.stepId, s)
    }
    return [...latest.values()].sort((a, b) => a.stepNumber - b.stepNumber)
  },
  { initial: [] },
)

const childTaskInstances = useLiveQueryWithDeps(
  [() => childInstanceSteps.value.map((s) => s.id).join(',')],
  async (db, [idsStr]) => {
    if (!idsStr) return []
    const ids = idsStr.split(',')
    const fetched = await Promise.all(
      ids.map((id) =>
        db.TaskInstance.where('[sourceType+sourceId]', ['WorkflowInstanceStep', id]).exec(),
      ),
    )
    return fetched.flat()
  },
  { initial: [] },
)

function activeTaskFor(childInstanceStepId) {
  const tasks = childTaskInstances.value.filter((t) => t.sourceId === childInstanceStepId)
  if (!tasks.length) return null
  const active = tasks.find((t) => ['ASSIGNED', 'IN_PROGRESS'].includes(t.statusId))
  if (active) return active
  return tasks.sort(
    (a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0),
  )[0]
}

function childTitle(child) {
  return childStepDefs.value.find((d) => d.id === child.stepId)?.name || 'Step'
}

function childDueDate(child) {
  const def = childStepDefs.value.find((d) => d.id === child.stepId)
  if (!def?.slaDays || !child.startedAt) return null
  return child.startedAt.plus({ days: def.slaDays })
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

function getStatusLabel(statusId) {
  if (!statusId) return '—'
  if (statusId === 'APPROVED') return 'Completed'
  return statusId.replace('_', ' ')
}
</script>

<template>
  <div class="tw:flex tw:flex-col tw:gap-1.5">
    <div
      v-for="child in childInstanceSteps"
      :key="child.id"
      class="tw:flex tw:items-center tw:justify-between tw:gap-3 tw:bg-main-hover/40 tw:border tw:border-divider tw:border-l-2 tw:border-l-primary/40 tw:rounded-md tw:px-3 tw:py-1.5"
    >
      <div class="tw:flex tw:items-center tw:gap-2 tw:min-w-0 tw:flex-1">
        <span class="tw:text-xs tw:font-medium tw:text-on-main tw:truncate">
          {{ childTitle(child) }}
        </span>
        <BaseBadge class="tw:text-[9px]" :class="getStepStatusClass(child.statusId)">
          {{ getStatusLabel(child.statusId) }}
        </BaseBadge>
      </div>
      <div class="tw:flex tw:items-center tw:gap-3 tw:text-[11px] tw:text-secondary tw:shrink-0">
        <UserAvatarById
          v-if="activeTaskFor(child.id)?.assignedTo"
          :userId="activeTaskFor(child.id).assignedTo"
          class="tw:size-6"
        />
        <span v-else>—</span>
        <span>{{ childDueDate(child)?.formatDate('date') || '—' }}</span>
      </div>
    </div>
  </div>
</template>

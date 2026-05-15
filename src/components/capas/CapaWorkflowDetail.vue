<script setup>
const props = defineProps({
  capaId: { type: String, required: true },
  workflowInstanceId: { type: String, default: null },
})

const workflowInstanceSteps = useLiveQueryWithDeps(
  [() => props.workflowInstanceId],
  async (db, [instanceId]) => {
    if (!instanceId) return []
    const all = await db.WorkflowInstanceStep.where('workflowInstanceId', instanceId)
      .orderBy('stepNumber', 'asc')
      .exec()
    // Collapse to the latest instance per stepId (handles send-back churn).
    const latestByStepId = new Map()
    for (const step of all) {
      const existing = latestByStepId.get(step.stepId)
      if (!existing || step.createdAt > existing.createdAt) {
        latestByStepId.set(step.stepId, step)
      }
    }
    const latest = [...latestByStepId.values()]
    // Only show root-level instance steps at this depth — children are rendered
    // nested inside their parent stage by CapaWorkflowStep.
    const stepIds = latest.map((s) => s.stepId)
    if (stepIds.length === 0) return []
    const defs = await Promise.all(stepIds.map((id) => db.WorkflowStep.findByPk(id)))
    const isRoot = new Map(defs.filter(Boolean).map((d) => [d.id, !d.parentStepId]))
    return latest
      .filter((s) => isRoot.get(s.stepId))
      .sort((a, b) => a.stepNumber - b.stepNumber)
  },
  { initial: [] },
)
</script>

<template>
  <template v-if="workflowInstanceSteps.length">
    <CapaWorkflowStep
      v-for="step in workflowInstanceSteps"
      :key="step.id"
      :instanceStepId="step.id"
      :capaId="capaId"
    />
  </template>
</template>

<script setup>
const props = defineProps({
  stageId: { type: String, required: true },
  versionId: { type: String, required: true },
  canUpdate: { type: Boolean, default: false },
})

// All stages for this version, sorted by order
const allStages = useLiveQueryWithDeps(
  [() => props.versionId],
  async (db, [versionId]) => {
    if (!versionId) return []
    return db.NcWorkflowTemplateStage.where('workflowTemplateVersionId', versionId)
      .orderBy('stageOrder')
      .exec()
  },
  { initial: [] },
)

// Current stage's order (to show only earlier stages)
const currentStage = useLiveQueryWithDeps(
  [() => props.stageId],
  async (db, [stageId]) => {
    if (!stageId) return null
    return db.NcWorkflowTemplateStage.findByPk(stageId)
  },
  { initial: null },
)

// Earlier stages only
const earlierStages = computed(() => {
  if (!currentStage.value) return []
  return allStages.value.filter((s) => s.stageOrder < currentStage.value.stageOrder)
})

// Current send-back targets
const sendBackTargets = useLiveQueryWithDeps(
  [() => props.stageId],
  async (db, [stageId]) => {
    if (!stageId) return []
    return db.NcWorkflowTemplateStageSendBackTarget.where('stageId', stageId).exec()
  },
  { initial: [] },
)

const targetStageIds = computed(() => sendBackTargets.value.map((t) => t.targetStageId))

const createTarget = useLiveMutation(async (db, { stageId, targetStageId }) => {
  const t = db.NcWorkflowTemplateStageSendBackTarget.create({ stageId, targetStageId })
  await t.save()
})

async function toggleTarget(targetStageId) {
  if (!props.canUpdate) return
  const existing = sendBackTargets.value.find((t) => t.targetStageId === targetStageId)
  if (existing) {
    await existing.delete()
  } else {
    await createTarget({ stageId: props.stageId, targetStageId })
  }
}
</script>

<template>
  <div class="tw:space-y-2">
    <p v-if="earlierStages.length === 0" class="tw:text-sm tw:text-secondary tw:italic">
      First stage — nothing to send back to.
    </p>

    <label
      v-for="stage in earlierStages"
      :key="stage.id"
      class="tw:flex tw:items-center tw:gap-3 tw:p-2 tw:rounded-lg tw:transition-colors"
      :class="[
        targetStageIds.includes(stage.id)
          ? 'tw:bg-primary/10 tw:border tw:border-primary/20'
          : 'tw:hover:bg-main-hover',
        canUpdate ? 'tw:cursor-pointer' : 'tw:cursor-default',
      ]"
    >
      <BaseCheckbox
        :modelValue="targetStageIds.includes(stage.id)"
        :disabled="!canUpdate"
        @update:modelValue="canUpdate && toggleTarget(stage.id)"
      />
      <span
        class="tw:text-xs tw:font-mono tw:bg-main-hover tw:text-secondary tw:px-1.5 tw:py-0.5 tw:rounded"
      >
        #{{ stage.stageOrder }}
      </span>
      <span class="tw:text-sm tw:text-on-main">{{ stage.name }}</span>
    </label>
  </div>
</template>

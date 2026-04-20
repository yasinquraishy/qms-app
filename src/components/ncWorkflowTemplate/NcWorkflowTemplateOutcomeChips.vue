<script setup>
const props = defineProps({
  stageId: { type: String, required: true },
  canUpdate: { type: Boolean, default: false },
})

const emit = defineEmits(['sendBackToggled'])

const outcomes = useLiveQuery(
  (db) => db.NcWorkflowTemplateStageOutcome.where().orderBy('displayOrder').exec(),
  { initial: [] },
)

const stageOutcomes = useLiveQueryWithDeps(
  [() => props.stageId],
  async (db, [stageId]) => {
    if (!stageId) return []
    return db.NcWorkflowTemplateStageOnOutcome.where('stageId', stageId).exec()
  },
  { initial: [] },
)

const activeOutcomeIds = computed(() => stageOutcomes.value.map((o) => o.outcomeId))

const createOutcome = useLiveMutation(async (db, { stageId, outcomeId }) => {
  const o = db.NcWorkflowTemplateStageOnOutcome.create({ stageId, outcomeId })
  await o.save()
})

async function toggleOutcome(outcomeId) {
  if (!props.canUpdate) return
  const existing = stageOutcomes.value.find((o) => o.outcomeId === outcomeId)
  if (existing) {
    await existing.delete()
    if (outcomeId === 'SEND_BACK') emit('sendBackToggled', false)
  } else {
    await createOutcome({ stageId: props.stageId, outcomeId })
    if (outcomeId === 'SEND_BACK') emit('sendBackToggled', true)
  }
}
</script>

<template>
  <div class="tw:flex tw:flex-wrap tw:gap-2">
    <button
      v-for="outcome in outcomes"
      :key="outcome.id"
      class="tw:flex tw:items-center tw:gap-1.5 tw:px-3 tw:py-1.5 tw:rounded-full tw:text-xs tw:font-semibold tw:border tw:transition-all"
      :class="
        activeOutcomeIds.includes(outcome.id)
          ? 'tw:bg-primary tw:text-white tw:border-primary'
          : 'tw:bg-main tw:text-secondary tw:border-divider tw:hover:border-primary tw:hover:text-primary'
      "
      :disabled="!canUpdate"
      @click="toggleOutcome(outcome.id)"
    >
      <span class="tw:text-[10px]">{{ activeOutcomeIds.includes(outcome.id) ? '✓' : '+' }}</span>
      {{ outcome.name }}
    </button>

    <p v-if="outcomes.length === 0" class="tw:text-xs tw:text-secondary">Loading outcomes…</p>
  </div>
</template>

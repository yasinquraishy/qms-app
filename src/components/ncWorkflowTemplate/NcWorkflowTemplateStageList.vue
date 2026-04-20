<script setup>
import { IconPlus } from '@tabler/icons-vue'

const props = defineProps({
  versionId: { type: String, required: true },
  canUpdate: { type: Boolean, default: false },
  autoAddStage: { type: Boolean, default: false },
})

const stageId = defineModel('stageId', {
  type: String,
  default: null,
})

const stages = useLiveQueryWithDeps(
  [() => props.versionId],
  async (db, [vId]) => {
    if (!vId) return []
    return db.NcWorkflowTemplateStage.where('workflowTemplateVersionId', vId)
      .orderBy('stageOrder')
      .exec()
  },
  { initial: [] },
)

// Auto-add first stage when autoAddStage is enabled and version has no stages
watch(stages, async (newStages) => {
  if (props.autoAddStage && props.canUpdate && newStages?.length === 0 && props.versionId) {
    await nextTick()
    await addStage()
  }
})

function selectStage(stage) {
  stageId.value = stage.id
}

const createStage = useLiveMutation(async (db, { versionId, order }) => {
  const stage = db.NcWorkflowTemplateStage.create({
    workflowTemplateVersionId: versionId,
    name: `Stage ${order}`,
    description: '',
    stageOrder: order,
  })
  await stage.save()
  return stage
})

async function addStage() {
  const order = stages.value.length + 1
  const stage = await createStage({ versionId: props.versionId, order })
  if (stage) stageId.value = stage.id
}

async function removeStage(index) {
  const stage = stages.value[index]
  if (!stage) return
  const wasSelected = stageId.value === stage.id
  await stage.delete()
  const remaining = stages.value.filter((_, i) => i !== index)
  await Promise.all(
    remaining.map((s, i) => {
      s.stageOrder = i + 1
      return s.save()
    }),
  )
  if (wasSelected) {
    const newIndex = Math.max(0, index - 1)
    stageId.value = remaining[newIndex]?.id ?? null
  }
}

async function moveStageUp(index) {
  if (index > 0) await swapStages(index, index - 1)
}

async function moveStageDown(index) {
  if (index < stages.value.length - 1) await swapStages(index, index + 1)
}

async function swapStages(fromIndex, toIndex) {
  const a = stages.value[fromIndex]
  const b = stages.value[toIndex]
  if (!a || !b) return
  const tmpOrder = a.stageOrder
  a.stageOrder = b.stageOrder
  b.stageOrder = tmpOrder
  await Promise.all([a.save(), b.save()])
  stageId.value = a.id
}

defineExpose({ addStage })
</script>

<template>
  <aside
    class="tw:w-80 tw:lg:w-96 tw:bg-main-hover tw:border-r tw:border-divider tw:flex tw:flex-col tw:shrink-0"
  >
    <!-- Header -->
    <div class="tw:p-4 tw:border-b tw:border-divider tw:flex tw:items-center tw:justify-between">
      <h2 class="ds-label tw:text-on-main">Workflow Stages</h2>
      <span
        class="tw:text-xs tw:font-medium tw:text-secondary tw:bg-main tw:px-2 tw:py-0.5 tw:rounded"
      >
        {{ stages?.length ?? 0 }} Stage{{ (stages?.length ?? 0) !== 1 ? 's' : '' }}
      </span>
    </div>

    <!-- Stage Cards -->
    <div class="tw:flex-1 tw:overflow-y-auto tw:p-4">
      <template v-for="(stage, index) in stages" :key="stage.id ?? index">
        <NcWorkflowTemplateStageCard
          :stage="stage"
          :index="index"
          :isSelected="stage.id === stageId"
          :isFirst="index === 0"
          :isLast="index === stages.length - 1"
          :canUpdate="canUpdate"
          @select="selectStage(stage)"
          @remove="removeStage(index)"
          @moveUp="moveStageUp(index)"
          @moveDown="moveStageDown(index)"
        />

        <!-- Connector line between cards -->
        <div v-if="index < stages.length - 1" class="tw:mx-auto tw:w-0.5 tw:h-3 tw:bg-divider" />
      </template>

      <!-- Add Stage Button -->
      <button
        v-if="canUpdate"
        class="tw:w-full tw:py-4 tw:border-2 tw:border-dashed tw:border-divider tw:rounded-xl tw:flex tw:items-center tw:justify-center tw:gap-2 tw:text-secondary tw:hover:text-primary tw:hover:border-primary tw:hover:bg-primary/5 tw:transition-all tw:mt-3"
        @click="addStage"
      >
        <IconPlus :size="20" />
        <span class="tw:text-sm tw:font-bold">Add Stage</span>
      </button>
    </div>
  </aside>
</template>

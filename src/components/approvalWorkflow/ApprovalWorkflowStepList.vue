<script setup>
defineProps({
  canUpdate: { type: Boolean, default: false },
})

const steps = defineModel({
  type: Array,
  default: () => [],
})

const selectedIndex = defineModel('selectedIndex', {
  type: Number,
  default: 0,
})

function selectStep(index) {
  selectedIndex.value = index
}

function addStep() {
  if (!steps.value) return
  const newOrder = steps.value.length + 1
  steps.value.push({
    name: `Step ${newOrder}`,
    description: '',
    stepOrder: newOrder,
    approvalRule: 'ALL',
    slaDays: null,
    requireComments: false,
    requireEsignature: false,
    roleIds: [],
    reviewerIds: [],
  })
  selectedIndex.value = steps.value.length - 1
}

function removeStep(index) {
  if (!steps.value) return
  steps.value.splice(index, 1)
  // Reorder
  steps.value.forEach((step, i) => {
    step.stepOrder = i + 1
  })
  // Adjust selection
  if (selectedIndex.value >= steps.value.length) {
    selectedIndex.value = Math.max(0, steps.value.length - 1)
  }
}

function moveStepUp(index) {
  if (index > 0) {
    moveStepInternal(index, index - 1)
  }
}

function moveStepDown(index) {
  if (index < steps.value.length - 1) {
    moveStepInternal(index, index + 1)
  }
}

function moveStepInternal(fromIndex, toIndex) {
  if (!steps.value) return
  if (toIndex < 0 || toIndex >= steps.value.length) return
  const [moved] = steps.value.splice(fromIndex, 1)
  steps.value.splice(toIndex, 0, moved)
  // Reorder
  steps.value.forEach((step, i) => {
    step.stepOrder = i + 1
  })
  selectedIndex.value = toIndex
}

defineExpose({ addStep })
</script>

<template>
  <aside
    class="tw:w-80 tw:lg:w-96 tw:bg-main-hover tw:border-r tw:border-divider tw:flex tw:flex-col tw:shrink-0"
  >
    <!-- Header -->
    <div class="tw:p-4 tw:border-b tw:border-divider tw:flex tw:items-center tw:justify-between">
      <h2 class="ds-label tw:text-on-main">Workflow Sequence</h2>
      <span
        class="tw:text-xs tw:font-medium tw:text-secondary tw:bg-main tw:px-2 tw:py-0.5 tw:rounded"
      >
        {{ steps.length }} Step{{ steps.length !== 1 ? 's' : '' }}
      </span>
    </div>

    <!-- Step Cards -->
    <div class="tw:flex-1 tw:overflow-y-auto tw:p-4 tw:space-y-3">
      <ApprovalWorkflowStepCard
        v-for="(step, index) in steps"
        :key="index"
        :step="step"
        :index="index"
        :isSelected="index === selectedIndex"
        :isFirst="index === 0"
        :isLast="index === steps.length - 1"
        :canUpdate="canUpdate"
        @select="selectStep(index)"
        @remove="removeStep(index)"
        @moveUp="moveStepUp(index)"
        @moveDown="moveStepDown(index)"
      />

      <!-- Add Step Button -->
      <button
        v-if="canUpdate"
        class="tw:w-full tw:py-4 tw:border-2 tw:border-dashed tw:border-divider tw:rounded-xl tw:flex tw:items-center tw:justify-center tw:gap-2 tw:text-secondary tw:hover:text-primary tw:hover:border-primary tw:hover:bg-primary/5 tw:transition-all"
        @click="addStep"
      >
        <WIcon icon="add_circle" size="20px" />
        <span class="tw:text-sm tw:font-bold">Add Step</span>
      </button>
    </div>
  </aside>
</template>

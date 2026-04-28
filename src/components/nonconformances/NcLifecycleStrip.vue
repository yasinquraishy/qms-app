<script setup>
import { IconChevronRight } from '@tabler/icons-vue'

const props = defineProps({
  nc: { type: Object, default: null },
})

const STATUS_ORDER = [
  { id: 'DRAFT', label: 'Draft' },
  { id: 'UNDER_REVIEW', label: 'Review' },
  { id: 'UNDER_INVESTIGATION', label: 'Investigation' },
  { id: 'PENDING_DISPOSITION', label: 'Pending disposition' },
  { id: 'CLOSED', label: 'Closed' },
]

function stepState(stepId) {
  if (!props.nc) return 'todo'
  const currentIdx = STATUS_ORDER.findIndex((s) => s.id === props.nc.statusId)
  const stepIdx = STATUS_ORDER.findIndex((s) => s.id === stepId)
  if (stepIdx < currentIdx) return 'done'
  if (stepIdx === currentIdx) return 'current'
  return 'todo'
}
</script>

<template>
  <div
    class="tw:border tw:border-divider tw:rounded-lg tw:px-5 tw:py-3 tw:flex tw:items-center tw:overflow-x-auto tw:gap-0"
  >
    <template v-for="(step, i) in STATUS_ORDER" :key="step.id">
      <div
        class="tw:px-3 tw:py-1.5 tw:rounded-md tw:text-xs tw:font-medium tw:whitespace-nowrap tw:shrink-0"
        :class="{
          'tw:bg-green-100 tw:text-green-700': stepState(step.id) === 'done',
          'tw:bg-primary tw:text-white': stepState(step.id) === 'current',
          'tw:bg-main-hover tw:text-secondary': stepState(step.id) === 'todo',
        }"
      >
        {{ step.label }}
      </div>
      <IconChevronRight
        v-if="i < STATUS_ORDER.length - 1"
        :size="14"
        class="tw:text-secondary tw:shrink-0 tw:mx-1"
      />
    </template>
  </div>
</template>

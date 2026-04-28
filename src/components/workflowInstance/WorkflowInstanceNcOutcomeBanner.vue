<script setup>
import { IconInfoCircle, IconCircleCheck, IconCircleX, IconAlertTriangle } from '@tabler/icons-vue'

const props = defineProps({
  instanceStatusId: { type: String, default: 'IN_PROGRESS' },
})

const config = computed(() => {
  switch (props.instanceStatusId) {
    case 'COMPLETED':
      return {
        icon: IconCircleCheck,
        color: 'emerald',
        message: 'Review approved — this NC is now in the Investigation phase.',
      }
    case 'REJECTED':
      return {
        icon: IconCircleX,
        color: 'red',
        message: 'Review rejected — the NC has been returned to Draft.',
      }
    case 'CHANGES_REQUESTED':
      return {
        icon: IconAlertTriangle,
        color: 'orange',
        message: 'Changes were requested — the NC has been returned to Draft.',
      }
    default:
      return {
        icon: IconInfoCircle,
        color: 'blue',
        message: 'Completing this review will move the NC to the Investigation phase.',
      }
  }
})
</script>

<template>
  <div
    class="tw:rounded-lg tw:border tw:p-4 tw:flex tw:items-start tw:gap-3"
    :class="{
      'tw:bg-blue-50 tw:border-blue-200': config.color === 'blue',
      'tw:bg-emerald-50 tw:border-emerald-200': config.color === 'emerald',
      'tw:bg-red-50 tw:border-red-200': config.color === 'red',
      'tw:bg-orange-50 tw:border-orange-200': config.color === 'orange',
    }"
  >
    <component
      :is="config.icon"
      :size="18"
      class="tw:shrink-0 tw:mt-0.5"
      :class="{
        'tw:text-blue-600': config.color === 'blue',
        'tw:text-emerald-600': config.color === 'emerald',
        'tw:text-red-600': config.color === 'red',
        'tw:text-orange-600': config.color === 'orange',
      }"
    />
    <p
      class="tw:text-sm tw:font-medium"
      :class="{
        'tw:text-blue-700': config.color === 'blue',
        'tw:text-emerald-700': config.color === 'emerald',
        'tw:text-red-700': config.color === 'red',
        'tw:text-orange-700': config.color === 'orange',
      }"
    >
      {{ config.message }}
    </p>
  </div>
</template>

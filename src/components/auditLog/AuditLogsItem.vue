<script setup>
import {
  IconCirclePlus,
  IconCircleCheck,
  IconCircleX,
  IconEditCircle,
  IconSend,
  IconEdit,
  IconTrash,
  IconPackage,
  IconBan,
  IconHistory,
} from '@tabler/icons-vue'

defineProps({
  log: {
    type: Object,
    required: true,
  },
})

function getActionIcon(action) {
  if (action?.includes('CREATE')) return IconCirclePlus
  if (action?.includes('APPROVE')) return IconCircleCheck
  if (action?.includes('REJECT')) return IconCircleX
  if (action?.includes('REQUEST_CHANGES')) return IconEditCircle
  if (action?.includes('SUBMIT')) return IconSend
  if (action?.includes('UPDATE')) return IconEdit
  if (action?.includes('DELETE')) return IconTrash
  if (action?.includes('ARCHIVE')) return IconPackage
  if (action?.includes('CANCEL')) return IconBan
  if (action?.includes('SET_EFFECTIVE')) return IconCircleCheck
  return IconHistory
}

function getActionColor(action) {
  if (action?.includes('CREATE')) return 'tw:text-green-600'
  if (action?.includes('APPROVE') || action?.includes('SET_EFFECTIVE')) return 'tw:text-emerald-600'
  if (action?.includes('REJECT') || action?.includes('DELETE')) return 'tw:text-red-600'
  if (action?.includes('REQUEST_CHANGES') || action?.includes('CANCEL')) return 'tw:text-orange-600'
  if (action?.includes('SUBMIT')) return 'tw:text-blue-600'
  if (action?.includes('UPDATE')) return 'tw:text-indigo-600'
  if (action?.includes('ARCHIVE')) return 'tw:text-gray-500'
  return 'tw:text-secondary'
}

function getPerformerName(log) {
  if (!log.performer) return 'System'
  return `${log.performer.firstName} ${log.performer.lastName}`.trim()
}
</script>

<template>
  <div
    class="tw:px-5 tw:py-3 tw:flex tw:items-start tw:gap-4 tw:hover:bg-main-hover tw:transition-colors"
  >
    <!-- Action icon -->
    <div class="tw:shrink-0 tw:pt-0.5">
      <component :is="getActionIcon(log.action)" :size="20" :class="getActionColor(log.action)" />
    </div>

    <!-- Content -->
    <div class="tw:flex-1 tw:min-w-0">
      <div class="tw:flex tw:items-center tw:gap-2 tw:flex-wrap">
        <span class="tw:text-sm tw:font-semibold tw:text-on-main">
          {{ log.action?.replace(/_/g, ' ') }}
        </span>
        <span
          class="tw:text-[10px] tw:px-1.5 tw:py-0.5 tw:rounded tw:bg-main tw:text-secondary tw:border tw:border-divider"
        >
          {{ log.entityType }}
        </span>
      </div>
      <div class="tw:text-xs tw:text-secondary tw:mt-0.5">
        by {{ getPerformerName(log) }}
        <span class="tw:mx-1">&middot;</span>
        {{ log.performedAt.formatDate('date') }}
      </div>
    </div>
  </div>
</template>

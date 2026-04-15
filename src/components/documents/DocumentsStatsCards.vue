<script setup>
import {
  IconNotes,
  IconClipboardList,
  IconCircleCheck,
  IconChecks,
  IconArchive,
  IconFolder,
  IconFileDescription,
} from '@tabler/icons-vue'

defineProps({
  stats: {
    type: Array,
    default: () => [],
  },
  total: {
    type: Number,
    default: 0,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const iconMap = {
  DRAFT: IconNotes,
  IN_REVIEW: IconClipboardList,
  APPROVED: IconCircleCheck,
  EFFECTIVE: IconChecks,
  OBSOLETE: IconArchive,
  ARCHIVED: IconArchive,
}

const colorMap = {
  DRAFT: 'tw:text-gray-500',
  IN_REVIEW: 'tw:text-orange-500',
  APPROVED: 'tw:text-green-600',
  EFFECTIVE: 'tw:text-blue-600',
  OBSOLETE: 'tw:text-gray-400',
  ARCHIVED: 'tw:text-gray-400',
}

const nameMap = {
  DRAFT: 'Draft',
  IN_REVIEW: 'In Review',
  APPROVED: 'Approved',
  EFFECTIVE: 'Effective',
  OBSOLETE: 'Obsolete',
  ARCHIVED: 'Archived',
}

function getIcon(statusId) {
  return iconMap[statusId] || IconFileDescription
}

function getColorClass(statusId) {
  return colorMap[statusId] || 'tw:text-gray-500'
}

function getName(statusId) {
  return nameMap[statusId] || statusId
}
</script>

<template>
  <div class="tw:grid tw:grid-cols-2 tw:md:grid-cols-4 tw:xl:grid-cols-6 tw:gap-3">
    <!-- Total Card -->
    <div class="tw:bg-sidebar tw:rounded-xl tw:border tw:border-divider tw:p-4">
      <div class="tw:flex tw:items-center tw:gap-3">
        <div class="tw:bg-primary/10 tw:rounded-lg tw:p-2">
          <IconFolder :size="24" class="tw:text-primary" />
        </div>
        <div>
          <div class="tw:text-2xl tw:font-bold tw:text-on-sidebar">{{ total }}</div>
          <div class="tw:text-xs tw:text-secondary">Total</div>
        </div>
      </div>
    </div>

    <!-- Status Cards -->
    <div
      v-for="stat in stats"
      :key="stat.statusId"
      class="tw:bg-sidebar tw:rounded-xl tw:border tw:border-divider tw:p-4"
    >
      <div class="tw:flex tw:items-center tw:gap-3">
        <div class="tw:bg-main-hover tw:rounded-lg tw:p-2">
          <component
            :is="getIcon(stat.statusId)"
            :size="24"
            :class="getColorClass(stat.statusId)"
          />
        </div>
        <div>
          <div class="tw:text-2xl tw:font-bold tw:text-on-sidebar">{{ stat.count }}</div>
          <div class="tw:text-xs tw:text-secondary">{{ getName(stat.statusId) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

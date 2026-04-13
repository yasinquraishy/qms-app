<script setup>
defineProps({
  statusId: {
    type: String,
    default: null,
  },
  showDot: {
    type: Boolean,
    default: true,
  },
})

const STATUS_MAP = {
  ACTIVE: { label: 'Active', class: 'tw:bg-green-100 tw:text-green-700' },
  DRAFT: { label: 'Draft', class: 'tw:bg-amber-100 tw:text-amber-700' },
  ARCHIVED: { label: 'Archived', class: 'tw:bg-gray-100 tw:text-gray-600' },
  ARCHIVE: { label: 'Archived', class: 'tw:bg-gray-100 tw:text-gray-600' },
  INACTIVE: { label: 'Inactive', class: 'tw:bg-gray-100 tw:text-gray-600' },
}

const dotClass = {
  ACTIVE: 'tw:bg-green-600',
  DRAFT: 'tw:bg-amber-600',
  ARCHIVED: 'tw:bg-gray-500',
  ARCHIVE: 'tw:bg-gray-500',
  INACTIVE: 'tw:bg-gray-500',
}
</script>

<template>
  <BaseBadge v-bind="$attrs" :class="STATUS_MAP[statusId]?.class">
    <div
      v-if="showDot"
      class="tw:rounded-full tw:size-1.5 tw:shrink-0"
      :class="dotClass[statusId] || 'tw:bg-gray-500'"
    />
    {{ STATUS_MAP[statusId]?.label || statusId || '—' }}
  </BaseBadge>
</template>

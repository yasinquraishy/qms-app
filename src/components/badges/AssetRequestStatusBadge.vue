<script setup>
defineProps({
  status: {
    type: Object,
    required: true,
  },
  showDot: {
    type: Boolean,
    default: true,
  },
})

const SCHEME_MAP = {
  PENDING: { class: 'tw:bg-amber-100 tw:text-amber-700', dot: 'tw:bg-amber-600' },
  SUBMITTED: { class: 'tw:bg-blue-100 tw:text-blue-700', dot: 'tw:bg-blue-600' },
  RECEIVED: { class: 'tw:bg-indigo-100 tw:text-indigo-700', dot: 'tw:bg-indigo-600' },
  APPROVED: { class: 'tw:bg-green-100 tw:text-green-700', dot: 'tw:bg-green-600' },
  REJECTED: { class: 'tw:bg-red-100 tw:text-red-700', dot: 'tw:bg-red-600' },
  OVERDUE: { class: 'tw:bg-orange-100 tw:text-orange-700', dot: 'tw:bg-orange-600' },
}

const scheme = (id) =>
  SCHEME_MAP[id] || { class: 'tw:bg-gray-100 tw:text-gray-600', dot: 'tw:bg-gray-500' }
</script>

<template>
  <BaseBadge v-bind="$attrs" :class="scheme(status.id).class">
    <template #icon>
      <div v-if="showDot" class="tw:rounded-full tw:size-1.5" :class="scheme(status.id).dot" />
    </template>
    {{ status.name || status.id || '—' }}
  </BaseBadge>
</template>

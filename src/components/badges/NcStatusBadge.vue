<script setup>
defineProps({
  status: {
    type: Object,
    required: true,
  },
})

const SCHEME_MAP = {
  DRAFT: 'tw:bg-gray-100 tw:text-gray-600',
  UNDER_REVIEW: 'tw:bg-blue-100 tw:text-blue-700',
  UNDER_INVESTIGATION: 'tw:bg-indigo-100 tw:text-indigo-700',
  PENDING_DISPOSITION: 'tw:bg-amber-100 tw:text-amber-700',
  CLOSED: 'tw:bg-green-100 tw:text-green-700',
  VOID: 'tw:bg-red-100 tw:text-red-600',
}

function scheme(id) {
  return SCHEME_MAP[id] || 'tw:bg-gray-100 tw:text-gray-600'
}
</script>

<template>
  <BaseBadge v-bind="$attrs" :class="scheme(status.id)" :showDot="true">
    {{ status.name || status.id }}
  </BaseBadge>
</template>

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
  ACTIVE: { class: 'tw:bg-green-100 tw:text-green-700', dot: 'tw:bg-green-600' },
  UNDER_REVIEW: { class: 'tw:bg-amber-100 tw:text-amber-700', dot: 'tw:bg-amber-600' },
  OBSOLETE: { class: 'tw:bg-gray-100 tw:text-gray-600', dot: 'tw:bg-gray-500' },
  DISCONTINUED: { class: 'tw:bg-red-100 tw:text-red-700', dot: 'tw:bg-red-600' },
}

function scheme(id) {
  return SCHEME_MAP[id] || { class: 'tw:bg-gray-100 tw:text-gray-600', dot: 'tw:bg-gray-500' }
}
</script>

<template>
  <BaseBadge v-bind="$attrs" :class="scheme(status.id).class" :showDot="showDot">
    {{ status.name || status.id || '—' }}
  </BaseBadge>
</template>

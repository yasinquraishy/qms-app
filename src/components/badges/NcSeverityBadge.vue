<script setup>
defineProps({
  severity: {
    type: Object,
    required: true,
  },
})

const SCHEME_MAP = {
  CRITICAL: 'tw:bg-red-100 tw:text-red-700',
  MAJOR: 'tw:bg-orange-100 tw:text-orange-700',
  MINOR: 'tw:bg-yellow-100 tw:text-yellow-700',
}

function scheme(id) {
  return SCHEME_MAP[id] || 'tw:bg-gray-100 tw:text-gray-600'
}
</script>

<template>
  <BaseBadge v-bind="$attrs" :class="scheme(severity.id)">
    {{ severity.name || severity.id }}
  </BaseBadge>
</template>

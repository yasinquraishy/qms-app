<script setup>
defineProps({
  categoryId: {
    type: String,
    default: null,
  },
})

const CATEGORY_MAP = {
  'Raw Materials': { label: 'Raw Materials', class: 'tw:bg-blue-100 tw:text-blue-700' },
  Component: { label: 'Component', class: 'tw:bg-purple-100 tw:text-purple-700' },
  Service: { label: 'Service', class: 'tw:bg-teal-100 tw:text-teal-700' },
  Software: { label: 'Software', class: 'tw:bg-indigo-100 tw:text-indigo-700' },
}
</script>

<template>
  <BaseBadge
    v-if="categoryId && CATEGORY_MAP[categoryId]"
    v-bind="$attrs"
    :class="CATEGORY_MAP[categoryId].class"
    showDot
  >
    {{ CATEGORY_MAP[categoryId].label }}
  </BaseBadge>
  <BaseBadge v-else v-bind="$attrs">{{ categoryId || '—' }}</BaseBadge>
</template>

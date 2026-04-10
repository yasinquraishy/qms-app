<script setup>
defineProps({
  categoryId: {
    type: String,
    default: null,
  },
})

const CATEGORY_MAP = {
  'Raw Materials': {
    label: 'Raw Materials',
    class: 'tw:bg-blue-100 tw:text-blue-700',
    dot: 'tw:bg-blue-600',
  },
  Component: {
    label: 'Component',
    class: 'tw:bg-purple-100 tw:text-purple-700',
    dot: 'tw:bg-purple-600',
  },
  Service: { label: 'Service', class: 'tw:bg-teal-100 tw:text-teal-700', dot: 'tw:bg-teal-600' },
  Software: {
    label: 'Software',
    class: 'tw:bg-indigo-100 tw:text-indigo-700',
    dot: 'tw:bg-indigo-600',
  },
}
</script>

<template>
  <BaseBadge
    v-if="categoryId && CATEGORY_MAP[categoryId]"
    v-bind="$attrs"
    :class="CATEGORY_MAP[categoryId].class"
  >
    <template #icon>
      <div class="tw:rounded-full tw:size-1.5" :class="CATEGORY_MAP[categoryId].dot" />
    </template>
    {{ CATEGORY_MAP[categoryId].label }}
  </BaseBadge>
  <BaseBadge v-else v-bind="$attrs">{{ categoryId || '—' }}</BaseBadge>
</template>

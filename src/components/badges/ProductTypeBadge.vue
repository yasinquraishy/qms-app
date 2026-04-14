<script setup>
defineProps({
  type: {
    type: Object,
    required: true,
  },
})

const SCHEME_MAP = {
  FINISHED_GOOD: { class: 'tw:bg-blue-100 tw:text-blue-700', dot: 'tw:bg-blue-600' },
  RAW_MATERIAL: { class: 'tw:bg-orange-100 tw:text-orange-700', dot: 'tw:bg-orange-600' },
  COMPONENT: { class: 'tw:bg-purple-100 tw:text-purple-700', dot: 'tw:bg-purple-600' },
  SERVICE: { class: 'tw:bg-teal-100 tw:text-teal-700', dot: 'tw:bg-teal-600' },
}

function scheme(id) {
  return SCHEME_MAP[id] || { class: 'tw:bg-gray-100 tw:text-gray-600', dot: 'tw:bg-gray-500' }
}
</script>

<template>
  <BaseBadge v-bind="$attrs" :class="scheme(type.id).class">
    {{ type.name || type.id || '—' }}
  </BaseBadge>
</template>

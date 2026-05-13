<script setup>
defineProps({
  method: { type: String, default: null },
})

const METHOD_MAP = {
  fishbone: { label: 'Fishbone', class: 'tw:bg-orange-100 tw:text-orange-700' },
  '5why': { label: '5 Whys', class: 'tw:bg-blue-100 tw:text-blue-700' },
  isnot: { label: 'Is / Is Not', class: 'tw:bg-purple-100 tw:text-purple-700' },
  whytree: { label: 'Why Tree', class: 'tw:bg-teal-100 tw:text-teal-700' },
}

const scheme = (id) => METHOD_MAP[id] || { label: id, class: 'tw:bg-gray-100 tw:text-gray-600' }
</script>

<template>
  <BaseBadge v-if="method" v-bind="$attrs" :class="scheme(method).class">
    {{ scheme(method).label }}
  </BaseBadge>
</template>

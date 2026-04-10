<script setup>
defineProps({
  icon: {
    type: [Object, Function],
    default: null,
  },
  title: {
    type: String,
    default: 'No results found',
  },
  description: {
    type: String,
    default: null,
  },
})
</script>

<template>
  <div class="tw:flex tw:flex-col tw:items-center tw:justify-center tw:py-12 tw:text-center">
    <component :is="icon" v-if="icon" :size="40" class="tw:text-secondary tw:mb-3 tw:opacity-50" />
    <p class="tw:text-sm tw:font-semibold tw:text-on-main">{{ title }}</p>
    <p v-if="description" class="tw:text-xs tw:text-secondary tw:mt-1">{{ description }}</p>
  </div>
</template>

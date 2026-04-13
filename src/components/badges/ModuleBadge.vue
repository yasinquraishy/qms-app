<script setup>
defineProps({
  module: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <BaseBadge v-bind="$attrs">
    {{ module.name }}
  </BaseBadge>
</template>

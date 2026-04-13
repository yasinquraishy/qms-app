<script setup>
defineProps({
  optionSet: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <BaseBadge v-bind="$attrs">{{ optionSet.name }}</BaseBadge>
</template>

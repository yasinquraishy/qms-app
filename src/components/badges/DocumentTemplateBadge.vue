<script setup>
defineProps({
  documentTemplate: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <BaseBadge v-bind="$attrs">{{ documentTemplate.name }}</BaseBadge>
</template>

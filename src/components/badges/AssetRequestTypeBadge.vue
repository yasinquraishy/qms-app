<script setup>
defineProps({
  type: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <BaseBadge v-bind="$attrs">{{ type.name || type.id || '—' }}</BaseBadge>
</template>

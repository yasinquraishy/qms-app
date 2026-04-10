<script setup>
defineProps({
  role: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <BaseBadge v-bind="$attrs">{{ role.name }}</BaseBadge>
</template>

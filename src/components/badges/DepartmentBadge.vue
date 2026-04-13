<script setup>
defineProps({
  department: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <BaseBadge v-bind="$attrs">
    {{ department.name }}
  </BaseBadge>
</template>

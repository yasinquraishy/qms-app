<script setup>
defineProps({
  relatedStandard: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <BaseBadge v-bind="$attrs">
    {{ relatedStandard.name }}
  </BaseBadge>
</template>

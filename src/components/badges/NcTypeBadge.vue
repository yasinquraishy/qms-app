<script setup>
defineProps({
  type: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <BaseBadge v-bind="$attrs" class="tw:bg-gray-100 tw:text-gray-700">
    {{ type.name || type.id }}
  </BaseBadge>
</template>

<script setup>
defineProps({
  source: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <BaseBadge v-bind="$attrs" class="tw:bg-gray-100 tw:text-gray-700">
    {{ source.name || source.id }}
  </BaseBadge>
</template>

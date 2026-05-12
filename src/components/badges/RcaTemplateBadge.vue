<script setup>
defineProps({
  template: { type: Object, required: true },
})
</script>

<template>
  <BaseBadge v-bind="$attrs" class="tw:bg-gray-100 tw:text-gray-700">
    {{ template.name || template.id }}
  </BaseBadge>
</template>

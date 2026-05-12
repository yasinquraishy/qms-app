<script setup>
defineProps({
  template: { type: Object, required: true },
})
</script>

<template>
  <BaseBadge v-bind="$attrs" class="tw:bg-emerald-100 tw:text-emerald-700">
    {{ template.name || template.id }}
  </BaseBadge>
</template>

<script setup>
defineProps({
  site: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <BaseBadge v-bind="$attrs">
    {{ site.name }} ({{ site.code }})
  </BaseBadge>
</template>

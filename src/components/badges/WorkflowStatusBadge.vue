<script setup>
defineProps({
  status: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <BaseBadge v-bind="$attrs">
    <template v-if="$slots.icon" #icon>
      <slot name="icon" />
    </template>
    {{ status.name }}
  </BaseBadge>
</template>

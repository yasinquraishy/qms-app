<script setup>
defineProps({
  team: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <BaseBadge v-bind="$attrs">
    <template #icon>
      <span
        class="tw:inline-block tw:size-2.5 tw:rounded-full tw:flex-shrink-0"
        :style="{ backgroundColor: team.color || '#6366f1' }"
      />
    </template>
    {{ team.name }}
  </BaseBadge>
</template>

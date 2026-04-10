<script setup>
import { IconTruck } from '@tabler/icons-vue'

defineProps({
  supplier: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <BaseBadge v-bind="$attrs">
    <template #icon>
      <IconTruck :size="16" class="tw:text-secondary" />
    </template>
    {{ supplier.name }}
  </BaseBadge>
</template>

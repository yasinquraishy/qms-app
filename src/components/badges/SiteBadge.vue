<script setup>
import { IconMapPin } from '@tabler/icons-vue'

defineProps({
  site: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <BaseBadge v-bind="$attrs">
    <template #icon>
      <IconMapPin :size="16" class="tw:text-secondary" />
    </template>
    {{ site.name }}
  </BaseBadge>
</template>

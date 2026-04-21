<script setup>
import { IconSearch } from '@tabler/icons-vue'

const filters = defineModel('filters', {
  type: Object,
  required: true,
})
</script>

<template>
  <div class="tw:flex tw:items-center tw:gap-2 tw:p-2 tw:rounded-lg tw:bg-sidebar">
    <SafeTeleport to="#main-header-search">
      <BaseTextInput
        v-model="filters.search"
        placeholder="Search workflows by name or code..."
        class="tw:flex-1 tw:max-w-md"
      >
        <template #icon>
          <IconSearch :size="18" />
        </template>
      </BaseTextInput>
    </SafeTeleport>

    <div class="tw:flex-1 tw:min-w-40">
      <WorkflowsStatusSelectMenu v-model="filters.statusId" />
    </div>

    <!-- Actions Slot -->
    <slot name="actions" />
  </div>
</template>

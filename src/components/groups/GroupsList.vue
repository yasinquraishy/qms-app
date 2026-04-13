<script setup>
import { IconUsersGroup } from '@tabler/icons-vue'

defineProps({
  groups: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  canDelete: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <div v-if="loading" class="tw:flex tw:justify-center tw:p-4">
    <div
      class="tw:size-8 tw:animate-spin tw:rounded-full tw:border-2 tw:border-primary tw:border-t-transparent"
    />
  </div>

  <BaseEmptyState v-else-if="groups.length === 0" :icon="IconUsersGroup" title="No groups found" />

  <div v-else class="tw:flex tw:flex-col tw:gap-2">
    <GroupsListItem v-for="group in groups" :key="group.id" :group="group" :canDelete="canDelete" />
  </div>
</template>

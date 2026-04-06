<script setup>
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
    <QSpinner color="primary" size="3em" />
  </div>

  <WEmptyState v-else-if="groups.length === 0" icon="groups" title="No groups found" compact />

  <div v-else class="tw:flex tw:flex-col tw:gap-2">
    <GroupsListItem v-for="group in groups" :key="group.id" :group="group" :canDelete="canDelete" />
  </div>
</template>

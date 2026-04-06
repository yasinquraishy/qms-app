<script setup>
defineProps({
  users: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <div v-if="loading" class="tw:flex tw:justify-center tw:p-4">
    <QSpinner color="primary" size="3em" />
  </div>

  <WEmptyState v-else-if="users.length === 0" icon="people" title="No users found" compact />

  <div v-else class="tw:flex tw:flex-col tw:gap-2">
    <UsersListItem v-for="user in users" :key="user.id" :user="user" />
  </div>
</template>

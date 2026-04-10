<script setup>
import { IconUsers } from '@tabler/icons-vue'

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
    <div class="tw:size-8 tw:animate-spin tw:rounded-full tw:border-2 tw:border-primary tw:border-t-transparent" />
  </div>

  <div
    v-else-if="users.length === 0"
    class="tw:flex tw:flex-col tw:items-center tw:justify-center tw:py-16 tw:px-6 tw:text-center"
  >
    <div class="tw:flex tw:items-center tw:justify-center tw:size-16 tw:bg-neutral-100 tw:rounded-2xl tw:mb-4">
      <IconUsers :size="32" class="tw:text-neutral-400" />
    </div>
    <h3 class="tw:font-semibold tw:text-neutral-800 tw:text-lg tw:mb-1">No users found</h3>
  </div>

  <div v-else class="tw:flex tw:flex-col tw:gap-2">
    <UsersListItem v-for="user in users" :key="user.id" :user="user" />
  </div>
</template>

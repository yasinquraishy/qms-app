<script setup>
import { useUsers } from '@/composables/useUsers.js'
import { isAllowed } from '@/utils/currentSession.js'

const { users, loading, filters, fetchUsers } = useUsers()
const showCreateDialog = ref(false)

const canCreateUser = computed(() => isAllowed(['users:create']))

onMounted(() => {
  fetchUsers()
})
</script>

<template>
  <div class="tw:flex tw:flex-col tw:gap-3 tw:overflow-hidden tw:h-full tw:p-5">
    <SafeTeleport to="#main-header-title">
      <div class="tw:flex tw:items-center tw:gap-2 tw:text-on-sidebar">
        <WIcon icon="people" class="tw:text-primary" size="24px" />
        <h2 class="tw:text-lg tw:font-bold tw:tracking-tight tw:text-nowrap">Users</h2>
      </div>
    </SafeTeleport>

    <SafeTeleport to="#main-header-actions">
      <WBtn
        v-if="canCreateUser"
        label="Create User"
        icon="add"
        color="primary"
        unelevated
        class="tw:font-medium"
        @click="showCreateDialog = true"
      />
    </SafeTeleport>

    <!-- Page Header -->
    <div class="">
      <div class="tw:flex tw:flex-col tw:gap-3">
        <div class="tw:flex tw:flex-col tw:gap-1">
          <div class="tw:text-3xl tw:font-bold tw:text-on-sidebar">Users</div>
          <div class="tw:text-sm tw:text-secondary">Manage your organization's users.</div>
        </div>

        <UsersFilterToolbar v-model:filters="filters" />
      </div>
    </div>

    <div class="tw:flex tw:flex-col tw:flex-1 tw:gap-5 tw:overflow-auto">
      <UsersList :users="users" :loading="loading" />
    </div>

    <!-- Create User Dialog -->
    <UsersCreateUserDialog v-model="showCreateDialog" @created="fetchUsers" />
  </div>
</template>

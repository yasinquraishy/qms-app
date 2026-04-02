<script setup>
import { useGroups } from '@/composables/useGroups.js'
import { isAllowed } from '@/utils/currentSession.js'

const { groups, loading, filters, fetchGroups } = useGroups()
const showCreateDialog = ref(false)

const canCreateGroup = computed(() => isAllowed(['teams:create']))
const canDeleteGroup = computed(() => isAllowed(['teams:delete']))

onMounted(() => {
  fetchGroups()
})
</script>

<template>
  <div class="tw:flex tw:flex-col tw:gap-3 tw:h-full tw:p-5">
    <SafeTeleport to="#main-header-title">
      <div class="tw:flex tw:items-center tw:gap-2 tw:text-on-sidebar">
        <WIcon icon="groups" class="tw:text-primary" size="24px" />
        <h2 class="tw:text-lg tw:font-bold tw:tracking-tight tw:text-nowrap">Groups</h2>
      </div>
    </SafeTeleport>

    <SafeTeleport to="#main-header-actions">
      <WBtn
        v-if="canCreateGroup"
        label="Create Group"
        icon="add"
        color="primary"
        unelevated
        class="tw:font-medium"
        @click="showCreateDialog = true"
      />
    </SafeTeleport>

    <!-- Page Header -->
    <div class="tw:flex tw:items-center tw:justify-between">
      <div class="tw:flex tw:flex-col tw:gap-1">
        <div class="tw:text-3xl tw:font-bold tw:text-on-sidebar">Groups</div>
        <div class="tw:text-sm tw:text-secondary">
          Manage your organization's groups and team assignments.
        </div>
      </div>
    </div>

    <GroupsFilterToolbar v-model:filters="filters" />

    <GroupsList :groups="groups" :loading="loading" :canDelete="canDeleteGroup" />

    <!-- Create Group Dialog -->
    <GroupsCreateGroupDialog v-model="showCreateDialog" @created="fetchGroups" />
  </div>
</template>

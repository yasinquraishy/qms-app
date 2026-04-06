<script setup>
import { useRoles } from '@/composables/useRoles.js'
import { isAllowed } from '@/utils/currentSession.js'

const { roles, loading, filters } = useRoles()
const showCreateDialog = ref(false)

const canCreateRole = computed(() => isAllowed(['roles:create']))

onMounted(() => {
  filters.value.statusId = null // Show all roles by default
})
</script>

<template>
  <div class="tw:flex tw:flex-col tw:gap-3 tw:h-full tw:p-5">
    <SafeTeleport to="#main-header-title">
      <div class="tw:flex tw:items-center tw:gap-2 tw:text-on-sidebar">
        <WIcon icon="admin_panel_settings" class="tw:text-primary" size="24px" />
        <h2 class="tw:text-lg tw:font-bold tw:tracking-tight tw:text-nowrap">
          Roles Administration
        </h2>
      </div>
    </SafeTeleport>

    <SafeTeleport to="#main-header-actions">
      <WBtn
        v-if="canCreateRole"
        label="Create New Role"
        icon="add_circle"
        color="primary"
        unelevated
        class="tw:font-bold"
        @click="showCreateDialog = true"
      />
    </SafeTeleport>

    <!-- Page Header -->
    <div class="tw:flex tw:items-center tw:justify-between">
      <div class="tw:flex tw:flex-col tw:gap-1">
        <div class="tw:text-3xl tw:font-bold tw:text-on-sidebar">Roles Administration</div>
        <div class="tw:text-sm tw:text-secondary">
          Manage and define granular permissions for JSON-driven metadata templates.
        </div>
      </div>
    </div>

    <!-- Filter Toolbar -->
    <div class="tw:flex tw:items-center tw:gap-3">
      <div class="tw:relative tw:flex-1">
        <WInput
          v-model="filters.search"
          placeholder="Search roles by name or description..."
          dense
          outlined
          class="tw:w-full"
        >
          <template #prepend>
            <WIcon icon="search" size="20px" class="tw:text-secondary" />
          </template>
        </WInput>
      </div>
      <WBtn icon="filter_list" flat dense class="tw:text-secondary" />
    </div>

    <!-- Roles List -->
    <RolesList :roles="roles" :loading="loading" />
  </div>

  <!-- Create Role Dialog -->
  <RoleCreateDialog v-model="showCreateDialog" />
</template>

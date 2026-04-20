<script setup>
import { IconShield, IconPlus, IconSearch, IconFilter } from '@tabler/icons-vue'
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
        <IconShield :size="24" class="tw:text-primary" />
        <h2 class="tw:text-lg tw:font-bold tw:tracking-tight tw:text-nowrap">
          Roles Administration
        </h2>
      </div>
    </SafeTeleport>

    <SafeTeleport to="#main-header-actions">
      <button
        v-if="canCreateRole"
        class="tw:flex tw:items-center tw:gap-2 tw:px-4 tw:py-2 tw:bg-primary tw:text-white tw:font-bold tw:rounded-lg tw:hover:bg-primary/90 tw:transition-colors tw:border-0 tw:cursor-pointer"
        @click="showCreateDialog = true"
      >
        <IconPlus :size="18" />
        Create New Role
      </button>
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
        <IconSearch
          :size="18"
          class="tw:absolute tw:left-3 tw:top-1/2 tw:-translate-y-1/2 tw:text-secondary tw:pointer-events-none"
        />
        <BaseTextInput
          v-model="filters.search"
          placeholder="Search roles by name or description..."
          class="tw:pl-9"
        />
      </div>
      <button
        class="tw:p-2 tw:text-secondary tw:bg-transparent tw:border-0 tw:cursor-pointer tw:hover:text-on-main"
      >
        <IconFilter :size="20" />
      </button>
    </div>

    <!-- Roles List -->
    <RolesList :roles="roles" :loading="loading" />
  </div>

  <!-- Create Role Dialog -->
  <RoleCreateDialog v-model="showCreateDialog" />
</template>

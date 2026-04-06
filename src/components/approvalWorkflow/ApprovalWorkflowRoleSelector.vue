<script setup>
import { useRoles } from '@/composables/useRoles.js'

defineProps({
  canUpdate: { type: Boolean, default: false },
})

const roleIds = defineModel('roleIds', { type: Array, default: () => [] })

const { roles, loading, filters } = useRoles()

const selectedRoles = computed(() => {
  return roles.value.filter((role) => roleIds.value.includes(role.id))
})

function toggleRole(roleId) {
  const index = roleIds.value.indexOf(roleId)
  if (index === -1) {
    roleIds.value = [...roleIds.value, roleId]
  } else {
    roleIds.value = roleIds.value.filter((id) => id !== roleId)
  }
}

function removeRole(roleId) {
  const index = roleIds.value.indexOf(roleId)
  if (index !== -1) {
    roleIds.value = roleIds.value.filter((id) => id !== roleId)
  }
}
</script>

<template>
  <div class="tw:space-y-4">
    <!-- Search -->
    <div>
      <label class="tw:block tw:text-xs tw:font-bold tw:text-secondary tw:uppercase tw:mb-2">
        Select Roles
      </label>
      <WInput v-model="filters.search" placeholder="Search roles (e.g. Quality Manager...)" dense>
        <template #prepend>
          <WIcon icon="search" size="18px" class="tw:text-secondary" />
        </template>
      </WInput>
    </div>

    <!-- Selected Chips -->
    <div v-if="selectedRoles.length > 0" class="tw:flex tw:flex-wrap tw:gap-2">
      <div
        v-for="role in selectedRoles"
        :key="role.id"
        class="tw:flex tw:items-center tw:gap-2 tw:bg-main-hover tw:px-3 tw:py-1.5 tw:rounded-full tw:border tw:border-divider"
      >
        <span class="tw:text-xs tw:font-medium tw:text-on-main">{{ role.name }}</span>
        <button
          v-if="canUpdate"
          class="tw:text-secondary tw:hover:text-bad tw:transition-colors"
          @click="removeRole(role.id)"
        >
          <WIcon icon="close" size="14px" />
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="tw:flex tw:items-center tw:justify-center tw:py-4">
      <QSpinner color="primary" size="24px" />
    </div>

    <!-- Role List -->
    <div v-else class="tw:max-h-48 tw:overflow-y-auto tw:space-y-1">
      <div
        v-for="role in roles"
        :key="role.id"
        class="tw:flex tw:items-center tw:gap-3 tw:p-2 tw:rounded-lg tw:transition-colors"
        :class="[
          roleIds.includes(role.id)
            ? 'tw:bg-primary/10 tw:border tw:border-primary/20'
            : 'tw:hover:bg-main-hover',
          canUpdate ? 'tw:cursor-pointer' : 'tw:cursor-default',
        ]"
        @click="canUpdate && toggleRole(role.id)"
      >
        <QCheckbox
          :modelValue="roleIds.includes(role.id)"
          color="primary"
          dense
          :disable="!canUpdate"
          @click.stop
          @update:modelValue="canUpdate && toggleRole(role.id)"
        />
        <div class="tw:flex-1 tw:min-w-0">
          <div class="tw:text-sm tw:font-medium tw:text-on-main">{{ role.name }}</div>
          <div v-if="role.description" class="tw:text-xs tw:text-secondary tw:truncate">
            {{ role.description }}
          </div>
        </div>
      </div>

      <div
        v-if="roles.length === 0 && !loading"
        class="tw:text-center tw:py-4 tw:text-sm tw:text-secondary"
      >
        No roles found
      </div>
    </div>
  </div>
</template>

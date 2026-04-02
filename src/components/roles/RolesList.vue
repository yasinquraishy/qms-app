<script setup>
defineProps({
  roles: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <div class="tw:flex-1 tw:overflow-y-auto tw:space-y-4">
    <div v-if="loading" class="tw:flex tw:items-center tw:justify-center tw:py-12">
      <QSpinner color="primary" size="48px" />
    </div>

    <WEmptyState
      v-else-if="roles.length === 0"
      icon="admin_panel_settings"
      title="No roles found"
      description="Create your first role to get started."
    />

    <!-- Role Cards -->
    <RolesListingRow v-for="role in roles" :key="role.id" :role="role" />
  </div>
</template>

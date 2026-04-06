<script setup>
const showCreateDialog = ref(false)

function openDialog() {
  showCreateDialog.value = true
}
</script>

<template>
  <div class="tw:flex tw:flex-col tw:gap-3 tw:h-full tw:p-5">
    <SafeTeleport to="#main-header-title">
      <div class="tw:flex tw:items-center tw:gap-2 tw:text-on-sidebar">
        <WIcon icon="key" class="tw:text-primary" size="24px" />
        <h2 class="tw:text-lg tw:font-bold tw:tracking-tight tw:text-nowrap">API Keys</h2>
      </div>
    </SafeTeleport>

    <SafeTeleport to="#main-header-actions">
      <WBtn
        label="Create API Key"
        icon="sym_o_add"
        color="primary"
        unelevated
        class="tw:font-medium"
        @click="openDialog"
      />
    </SafeTeleport>

    <!-- Page Header -->
    <div class="tw:flex tw:items-center tw:justify-between">
      <div class="tw:flex tw:flex-col tw:gap-1">
        <div class="tw:text-3xl tw:font-bold tw:text-on-sidebar">API Keys</div>
        <div class="tw:text-sm tw:text-secondary">
          Manage your personal API keys for programmatic access.
        </div>
      </div>
    </div>

    <ApiKeyList @create="openDialog" />
  </div>

  <ApiKeyCreateDialog v-model="showCreateDialog" />
</template>

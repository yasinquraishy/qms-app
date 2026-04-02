<script setup>
import { useCompanySettings } from '@/composables/useCompanySettings.js'
import { Notify } from 'quasar'

const { formData, loading, saving, isDirty, saveSettings, discardChanges } = useCompanySettings()

async function handleSave() {
  const success = await saveSettings()

  if (success) {
    Notify.create({
      type: 'positive',
      message: 'Company settings updated successfully',
      position: 'top',
      timeout: 2000,
    })
  } else {
    Notify.create({
      type: 'negative',
      message: 'Failed to update company settings',
      position: 'top',
      timeout: 3000,
    })
  }
}

function handleDiscard() {
  discardChanges()
  Notify.create({
    type: 'info',
    message: 'Changes discarded',
    position: 'top',
    timeout: 2000,
  })
}
</script>

<template>
  <div class="tw:p-5">
    <SafeTeleport to="#main-header-title">
      <div class="tw:flex tw:items-center tw:gap-2 tw:text-on-sidebar">
        <WIcon icon="settings" class="tw:text-primary" size="24px" />
        <h2 class="tw:text-lg tw:font-bold tw:tracking-tight tw:text-nowrap">Company Settings</h2>
      </div>
    </SafeTeleport>

    <SafeTeleport to="#main-header-actions">
      <div class="tw:flex tw:gap-2">
        <WBtn label="Discard" outline :disable="!isDirty || saving" @click="handleDiscard" />
        <WBtn
          label="Save Changes"
          color="primary"
          unelevated
          icon="save"
          :loading="saving"
          :disable="!isDirty || saving"
          @click="handleSave"
        />
      </div>
    </SafeTeleport>

    <!-- Page Content -->
    <div v-if="loading" class="tw:flex tw:items-center tw:justify-center tw:h-full">
      <QSpinner size="48px" color="primary" />
    </div>

    <div v-else class="tw:flex tw:flex-col tw:gap-8 tw:max-w-6xl">
      <!-- Page Title & Description -->
      <div class="tw:flex tw:flex-col tw:gap-1">
        <div class="tw:text-3xl tw:font-bold tw:text-on-sidebar">Company Settings</div>
        <div class="tw:text-sm tw:text-secondary">
          Manage organization profile, branding, and regional preferences.
        </div>
      </div>

      <!-- General Information Card -->
      <CompanyInfoCard v-model="formData" />

      <!-- Two-column layout -->
      <div class="tw:grid tw:grid-cols-1 tw:lg:grid-cols-3 tw:gap-8">
        <!-- Left column (2/3 width) -->
        <div class="tw:lg:col-span-2 tw:flex tw:flex-col tw:gap-8">
          <CompanyBrandingCard v-model="formData" />
          <CompanyRegionalCard v-model="formData" />
        </div>

        <!-- Right column (1/3 width) - Metadata -->
        <CompanyMetadataCard :company="formData" />
      </div>
    </div>
  </div>
</template>

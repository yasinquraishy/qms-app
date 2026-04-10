<script setup>
import { IconSettings, IconDeviceFloppy } from '@tabler/icons-vue'
import { useCompanySettings } from '@/composables/useCompanySettings.js'
import { useToast } from '@shared/composables/useToast.js'

const { formData, loading, saving, isDirty, saveSettings, discardChanges } = useCompanySettings()
const toast = useToast()

async function handleSave() {
  const success = await saveSettings()

  if (success) {
    toast.notify({ type: 'positive', message: 'Company settings updated successfully' })
  } else {
    toast.notify({ type: 'negative', message: 'Failed to update company settings' })
  }
}

function handleDiscard() {
  discardChanges()
  toast.notify({ type: 'info', message: 'Changes discarded' })
}
</script>

<template>
  <div class="tw:p-5">
    <SafeTeleport to="#main-header-title">
      <div class="tw:flex tw:items-center tw:gap-2 tw:text-on-sidebar">
        <IconSettings class="tw:text-primary tw:size-6" />
        <h2 class="tw:text-lg tw:font-bold tw:tracking-tight tw:text-nowrap">Company Settings</h2>
      </div>
    </SafeTeleport>

    <SafeTeleport to="#main-header-actions">
      <div class="tw:flex tw:gap-2">
        <BaseButton variant="outline" :disabled="!isDirty || saving" @click="handleDiscard">
          Discard
        </BaseButton>
        <BaseButton :disabled="!isDirty || saving" @click="handleSave">
          <IconDeviceFloppy class="tw:size-4" />
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </BaseButton>
      </div>
    </SafeTeleport>

    <!-- Page Content -->
    <div v-if="loading" class="tw:flex tw:items-center tw:justify-center tw:h-full">
      <div
        class="tw:animate-spin tw:rounded-full tw:size-12 tw:border-4 tw:border-primary tw:border-t-transparent"
      />
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
          <CompanyDefaultsCard v-model="formData" />
        </div>

        <!-- Right column (1/3 width) - Metadata -->
        <CompanyMetadataCard :company="formData" />
      </div>
    </div>
  </div>
</template>

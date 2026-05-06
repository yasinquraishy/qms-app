<script setup>
import { IconSettings } from '@tabler/icons-vue'
import { currentCompany } from '@/utils/currentCompany.js'

const company = useLiveQueryWithDeps([() => currentCompany.value?.id], async (db, [id]) => {
  if (!id) return null
  return db.Company.findByPk(id)
})

const loading = computed(() => company.value === undefined)

watch(
  company,
  (c) => {
    if (!c) return
    // Backfill settings as {} if backend stored null so cards can bind safely.
    if (c.settings == null) c.settings = {}
    mirrorToCurrentCompany(c)
  },
  { deep: true, immediate: true },
)

function mirrorToCurrentCompany(c) {
  if (!currentCompany.value || c.id !== currentCompany.value.id) return
  currentCompany.value.name = c.name
  currentCompany.value.code = c.code
  currentCompany.value.defaultTimeZone = c.defaultTimeZone
  currentCompany.value.defaultFirstDayOfWeek = c.defaultFirstDayOfWeek
  currentCompany.value.companyIconUrl = c.companyIconUrl
  currentCompany.value.companyDarkIconUrl = c.companyDarkIconUrl
  currentCompany.value.settings = c.settings
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

    <div v-if="loading" class="tw:flex tw:items-center tw:justify-center tw:h-full">
      <div
        class="tw:animate-spin tw:rounded-full tw:size-12 tw:border-4 tw:border-primary tw:border-t-transparent"
      />
    </div>

    <div v-else-if="!company" class="tw:p-8 tw:text-center tw:text-secondary">
      Company not found.
    </div>

    <div v-else class="tw:flex tw:flex-col tw:gap-8 tw:max-w-6xl">
      <div class="tw:flex tw:flex-col tw:gap-1">
        <div class="tw:text-3xl tw:font-bold tw:text-on-sidebar">Company Settings</div>
        <div class="tw:text-sm tw:text-secondary">
          Manage organization profile, branding, and regional preferences.
        </div>
      </div>

      <CompanyInfoCard />

      <div class="tw:grid tw:grid-cols-1 tw:lg:grid-cols-3 tw:gap-8">
        <div class="tw:lg:col-span-2 tw:flex tw:flex-col tw:gap-8">
          <CompanyBrandingCard />
          <CompanyRegionalCard />
          <CompanyDefaultsCard />
        </div>

        <CompanyMetadataCard />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useImpersonate } from '@/composables/useImpersonate.js'
import { getCompanyPath } from '@/utils/routeHelpers'

const { companies } = useImpersonate()

const router = useRouter()

function onClick(company) {
  router.push(getCompanyPath(`/admin/impersonate/${company.id}`))
}
</script>

<template>
  <div class="tw:flex tw:flex-col tw:gap-2">
    <WCard
      v-for="company in companies"
      :key="company.id"
      flat
      bordered
      class="tw:p-3 tw:cursor-pointer tw:hover:bg-main-hover tw:transition-colors"
      @click="onClick(company)"
    >
      <div class="tw:flex tw:items-center tw:gap-3">
        <div v-if="company.companyIconUrl" class="tw:flex-none">
          <img :src="company.companyIconUrl" alt="Company" class="tw:w-12 tw:h-12 tw:rounded" />
        </div>
        <div
          v-else
          class="tw:bg-primary tw:flex tw:items-center tw:justify-center tw:rounded-lg tw:size-12 tw:text-white"
        >
          <WIcon icon="business" size="24px" />
        </div>

        <div class="tw:flex-1 tw:min-w-0">
          <div class="tw:text-lg tw:font-bold tw:text-on-main">{{ company.name }}</div>
          <div class="tw:text-sm tw:text-secondary">{{ company.code }}</div>
          <div v-if="company.defaultTimeZone" class="tw:text-xs tw:text-secondary tw:mt-1">
            {{ company.defaultTimeZone }}
          </div>
        </div>

        <WIcon icon="chevron_right" size="24px" class="tw:text-secondary" />
      </div>
    </WCard>
  </div>
</template>

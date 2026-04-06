<script setup>
import { useImpersonate } from '@/composables/useImpersonate.js'

const { companies, loading, search, fetchCompanies, hasMore } = useImpersonate()

const debouncedSearch = refDebounced(search, 400)

watch(debouncedSearch, () => {
  fetchCompanies()
})

onMounted(() => {
  fetchCompanies()
})

function loadMore() {
  fetchCompanies({ append: true })
}
</script>

<template>
  <div class="tw:flex tw:flex-col tw:gap-4 tw:p-6 tw:max-w-4xl tw:mx-auto">
    <SafeTeleport to="#main-header-title">
      <div class="tw:text-lg tw:font-bold tw:text-on-main">Impersonate</div>
    </SafeTeleport>

    <SafeTeleport to="#main-header-search">
      <WInput v-model="search" placeholder="Search companies..." clearable class="tw:w-full">
        <template #prepend>
          <WIcon icon="search" />
        </template>
      </WInput>
    </SafeTeleport>

    <div v-if="loading && companies.length === 0" class="tw:flex tw:justify-center tw:p-8">
      <QSpinner color="primary" size="3em" />
    </div>

    <WEmptyState
      v-else-if="companies.length === 0"
      icon="business"
      title="No companies found"
      compact
    />

    <template v-else>
      <ImpersonateCompanyList />

      <div v-if="hasMore" class="tw:flex tw:justify-center tw:py-4">
        <WBtn label="Load More" flat color="primary" :loading="loading" @click="loadMore" />
      </div>
    </template>
  </div>
</template>

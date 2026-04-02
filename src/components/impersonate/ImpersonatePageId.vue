<script setup>
import { useImpersonate } from '@/composables/useImpersonate.js'
import { getCompanyPath } from '@/utils/routeHelpers'

const props = defineProps({
  companyId: {
    type: String,
    required: true,
  },
})

const {
  companyDetail,
  companyUsers,
  companyUsersLoading,
  companyUsersSearch,
  fetchCompanyUsers,
  hasMoreUsers,
} = useImpersonate()

const debouncedSearch = refDebounced(companyUsersSearch, 400)

watch(debouncedSearch, () => {
  fetchCompanyUsers(props.companyId)
})

onMounted(() => {
  fetchCompanyUsers(props.companyId)
})

function loadMore() {
  fetchCompanyUsers(props.companyId, { append: true })
}
</script>

<template>
  <div class="tw:flex tw:flex-col tw:gap-4 tw:p-6 tw:max-w-4xl tw:mx-auto">
    <SafeTeleport to="#main-header-title">
      <div class="tw:flex tw:items-center tw:gap-2">
        <RouterLink
          :to="getCompanyPath('/admin/impersonate')"
          class="tw:text-secondary tw:hover:text-primary"
        >
          <WIcon icon="arrow_back" size="24px" />
        </RouterLink>
        <div class="tw:text-lg tw:font-bold tw:text-on-main">
          {{ companyDetail?.name || 'Company' }}
        </div>
      </div>
    </SafeTeleport>

    <SafeTeleport to="#main-header-search">
      <WInput
        v-model="companyUsersSearch"
        placeholder="Search users..."
        clearable
        class="tw:w-full"
      >
        <template #prepend>
          <WIcon icon="search" />
        </template>
      </WInput>
    </SafeTeleport>

    <!-- Company Details -->
    <WCard v-if="companyDetail" flat bordered class="tw:p-4">
      <div class="tw:flex tw:items-center tw:gap-4">
        <div v-if="companyDetail.companyIconUrl" class="tw:flex-none">
          <img
            :src="companyDetail.companyIconUrl"
            alt="Company"
            class="tw:w-16 tw:h-16 tw:rounded-lg"
          />
        </div>
        <div
          v-else
          class="tw:bg-primary tw:flex tw:items-center tw:justify-center tw:rounded-lg tw:size-16 tw:text-white"
        >
          <WIcon icon="business" size="32px" />
        </div>

        <div class="tw:flex-1">
          <div class="tw:text-xl tw:font-bold tw:text-on-main">{{ companyDetail.name }}</div>
          <div class="tw:text-sm tw:text-secondary">Code: {{ companyDetail.code }}</div>
          <div v-if="companyDetail.defaultTimeZone" class="tw:text-sm tw:text-secondary">
            Timezone: {{ companyDetail.defaultTimeZone }}
          </div>
        </div>
      </div>
    </WCard>

    <!-- Users Section -->
    <div class="tw:text-base tw:font-semibold tw:text-on-main">
      Users ({{ companyUsers.length }}{{ hasMoreUsers ? '+' : '' }})
    </div>

    <div
      v-if="companyUsersLoading && companyUsers.length === 0"
      class="tw:flex tw:justify-center tw:p-8"
    >
      <QSpinner color="primary" size="3em" />
    </div>

    <WEmptyState
      v-else-if="companyUsers.length === 0"
      icon="people"
      title="No users found"
      compact
    />

    <template v-else>
      <ImpersonateList />

      <div v-if="hasMoreUsers" class="tw:flex tw:justify-center tw:py-4">
        <WBtn
          label="Load More"
          flat
          color="primary"
          :loading="companyUsersLoading"
          @click="loadMore"
        />
      </div>
    </template>
  </div>
</template>

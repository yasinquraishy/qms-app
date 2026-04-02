<script setup>
const props = defineProps({
  company: {
    type: Object,
    required: true,
  },
})

const subscriptionBadgeColor = computed(() => {
  const state = props.company.subscriptionState?.toUpperCase()
  if (state === 'PREMIUM') return 'tw:bg-purple-100 tw:text-purple-800'
  if (state === 'TRIAL') return 'tw:bg-blue-100 tw:text-blue-800'
  return 'tw:bg-green-100 tw:text-green-800'
})

const statusBadgeColor = computed(() => {
  const state = props.company.stateId?.toUpperCase()
  if (state === 'ACTIVE') return 'tw:bg-primary/10 tw:text-primary'
  if (state === 'INACTIVE') return 'tw:bg-gray-100 tw:text-gray-800'
  return 'tw:bg-gray-100 tw:text-gray-800'
})

const formattedCreatedAt = computed(() => {
  return props.company.createdAt?.formatDate('date')
})

const formattedUpdatedAt = computed(() => {
  return props.company.updatedAt?.formatDate('date')
})
</script>

<template>
  <div class="tw:flex tw:flex-col tw:gap-6">
    <!-- System Information Card -->
    <div class="tw:rounded-xl tw:border tw:border-divider tw:shadow-sm tw:p-6 tw:bg-sidebar">
      <h3 class="ds-label tw:text-on-sidebar tw:mb-6">System Information</h3>
      <div class="tw:flex tw:flex-col tw:gap-6">
        <!-- Subscription -->
        <div class="tw:flex tw:justify-between tw:items-center">
          <span class="tw:text-sm tw:text-secondary">Subscription</span>
          <span
            class="tw:inline-flex tw:items-center tw:px-2.5 tw:py-0.5 tw:rounded-full tw:text-xs tw:font-bold"
            :class="subscriptionBadgeColor"
          >
            {{ company.subscriptionState || 'NORMAL' }}
          </span>
        </div>

        <!-- Account Status -->
        <div class="tw:flex tw:justify-between tw:items-center">
          <span class="tw:text-sm tw:text-secondary">Account Status</span>
          <span
            class="tw:inline-flex tw:items-center tw:px-2.5 tw:py-0.5 tw:rounded-full tw:text-xs tw:font-bold"
            :class="statusBadgeColor"
          >
            {{ company.stateId || 'ACTIVE' }}
          </span>
        </div>

        <!-- Created On -->
        <div class="tw:border-t tw:border-divider tw:pt-4">
          <div class="tw:flex tw:flex-col tw:gap-1">
            <span class="tw:text-xs tw:text-secondary tw:uppercase tw:font-semibold"
              >Created On</span
            >
            <p
              class="tw:text-sm tw:font-medium tw:text-on-sidebar tw:flex tw:items-center tw:gap-2"
            >
              <WIcon icon="calendar_today" size="16px" class="tw:text-secondary" />
              {{ formattedCreatedAt }}
            </p>
          </div>
        </div>

        <!-- Last Updated -->
        <div class="tw:pt-2">
          <div class="tw:flex tw:flex-col tw:gap-1">
            <span class="tw:text-xs tw:text-secondary tw:uppercase tw:font-semibold"
              >Last Updated</span
            >
            <p
              class="tw:text-sm tw:font-medium tw:text-on-sidebar tw:flex tw:items-center tw:gap-2"
            >
              <WIcon icon="history" size="16px" class="tw:text-secondary" />
              {{ formattedUpdatedAt }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Help Info Box -->
    <div class="tw:rounded-xl tw:bg-primary/5 tw:p-6 tw:border tw:border-primary/10">
      <div class="tw:flex tw:items-start tw:gap-3">
        <WIcon icon="info" class="tw:text-primary" size="24px" />
        <div class="tw:flex tw:flex-col tw:gap-1">
          <p class="tw:text-sm tw:font-bold tw:text-primary">Need help?</p>
          <p class="tw:text-xs tw:text-secondary tw:leading-relaxed">
            Changes to company settings might take up to 5 minutes to reflect across all user
            sessions.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

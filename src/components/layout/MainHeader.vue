<script setup>
import { useCompanyLocalStorage } from '@/utils/useCompanyLocalStorage'
import {
  isImpersonating,
  originalUserName,
  returnToOriginalUser,
  currentSession,
} from '@/utils/currentSession'

const drawer = useCompanyLocalStorage('sidebar-drawer', true)

const impersonatedName = computed(() => {
  if (!currentSession.value) return ''
  return `${currentSession.value.firstName || ''} ${currentSession.value.lastName || ''}`.trim()
})
</script>

<template>
  <!-- Impersonation Banner -->
  <div
    v-if="isImpersonating"
    class="tw:bg-amber-500 tw:text-white tw:text-center tw:py-2 tw:px-4 tw:text-sm tw:font-medium tw:flex tw:items-center tw:justify-center tw:gap-2"
  >
    <WIcon icon="supervisor_account" size="18px" />
    <span>
      You are impersonating <strong>{{ impersonatedName }}</strong
      >.
    </span>
    <WBtn
      flat
      dense
      noCaps
      label="Return to your account"
      class="tw:text-white tw:underline tw:font-bold"
      @click="returnToOriginalUser"
    />
    <span class="tw:text-white/70">({{ originalUserName }})</span>
  </div>

  <header
    class="tw:sticky tw:top-0 tw:z-10 tw:border-b tw:border-divider tw:bg-sidebar/80 tw:backdrop-blur-md tw:pe-4 tw:ps-2 tw:py-3"
  >
    <div class="tw:flex tw:flex-nowrap tw:items-center tw:justify-between tw:gap-4 tw:flex-1">
      <div class="tw:flex tw:items-center tw:gap-2 tw:flex-1 tw:max-w-2xl">
        <WBtn icon="menu" color="primary" flat round @click="drawer = !drawer" />

        <div id="main-header-title" />

        <div id="main-header-search" class="tw:w-full"></div>
      </div>

      <div class="tw:flex tw:items-center tw:gap-4">
        <div id="main-header-actions" />
        <NotificationsBell />
      </div>
    </div>
  </header>
</template>

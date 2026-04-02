<script setup>
import AcceptInvitationForm from '@/components/auth/AcceptInvitationForm.vue'

defineOptions({
  name: 'AcceptInvitationPage',
})
</script>

<template>
  <div class="tw:min-h-screen tw:bg-main tw:flex">
    <!-- Left side - Branding -->
    <div
      class="tw:flex-1 tw:bg-linear-to-br tw:from-primary tw:to-primary tw:hidden tw:md:flex tw:items-center tw:justify-center tw:p-12 tw:text-white"
    >
      <div class="tw:max-w-sm">
        <WIcon name="verified" size="48px" color="white" />
        <h1 class="tw:text-5xl tw:font-bold tw:mt-6 tw:mb-2 tw:tracking-tight">QMS</h1>
        <p class="tw:text-lg tw:opacity-90 tw:mb-12">Quality Management System</p>
        <div class="tw:flex tw:flex-col tw:gap-4">
          <div class="tw:flex tw:items-center tw:gap-2">
            <WIcon name="check_circle" size="20px" color="white" />
            <span>Document Control</span>
          </div>
          <div class="tw:flex tw:items-center tw:gap-2">
            <WIcon name="check_circle" size="20px" color="white" />
            <span>Audit Management</span>
          </div>
          <div class="tw:flex tw:items-center tw:gap-2">
            <WIcon name="check_circle" size="20px" color="white" />
            <span>Compliance Tracking</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Right side - Accept Invitation Form -->
    <div
      class="tw:flex-1 tw:min-h-screen tw:bg-sidebar tw:flex tw:flex-col tw:items-center tw:justify-center tw:p-8"
    >
      <AcceptInvitationForm />

      <div class="tw:text-xs tw:text-secondary tw:text-center tw:mt-6">
        © 2026 Quality Management System. All rights reserved.
      </div>
    </div>
  </div>
</template>

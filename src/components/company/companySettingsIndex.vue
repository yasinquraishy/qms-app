<script setup>
import { provideCompanySettings } from '@/composables/useCompanySettings.js'

provideCompanySettings()
</script>

<template>
  <CompanySettingsHome />
</template>

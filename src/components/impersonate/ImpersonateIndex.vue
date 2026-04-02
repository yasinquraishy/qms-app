<script setup>
import { provideImpersonate } from '@/composables/useImpersonate.js'

defineProps({
  companyId: {
    type: String,
    default: undefined,
  },
})

provideImpersonate()
</script>

<template>
  <ImpersonatePageId v-if="companyId" :companyId="companyId" />
  <ImpersonateHome v-else />
</template>

<script setup>
import { useImpersonate } from '@/composables/useImpersonate.js'

const { companyUsers } = useImpersonate()
</script>

<template>
  <div class="tw:flex tw:flex-col tw:gap-2">
    <ImpersonateListItem v-for="user in companyUsers" :key="user.id" :user="user" />
  </div>
</template>

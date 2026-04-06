<script setup>
import { provideNotifications } from '@/composables/useNotifications.js'

provideNotifications()
</script>

<template>
  <NotificationsBell />
</template>

<script setup>
import { provideUsers } from '@/composables/useUsers.js'
import UserPageId from './UserPageId.vue'

defineProps({
  id: {
    type: String,
    default: undefined,
  },
})

provideUsers()
</script>

<template>
  <UserPageId v-if="id" :id="id" />
  <UsersHome v-else />
</template>

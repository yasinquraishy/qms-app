<script setup>
import UserPageId from './UserPageId.vue'

defineProps({
  id: {
    type: String,
    default: undefined,
  },
})
</script>

<template>
  <UserPageId v-if="id" :id="id" />
  <UsersHome v-else />
</template>

<script setup>
import { provideGroups } from '@/composables/useGroups.js'
import GroupPageId from './GroupPageId.vue'

defineProps({
  id: {
    type: String,
    default: undefined,
  },
})

provideGroups()
</script>

<template>
  <GroupPageId v-if="id" :id="id" />
  <GroupsHome v-else />
</template>

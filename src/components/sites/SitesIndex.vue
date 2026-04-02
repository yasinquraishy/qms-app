<script setup>
import { provideSites } from '@/composables/useSites.js'

defineProps({
  id: {
    type: String,
    default: undefined,
  },
})

provideSites()
</script>

<template>
  <SitesHome v-if="!id" />
  <RouterView v-else :id="id" />
</template>

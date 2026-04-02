<script setup>
import { provideRecords } from '@/composables/useRecords.js'

defineProps({
  id: {
    type: String,
    default: undefined,
  },
})

provideRecords()
</script>

<template>
  <RecordsHome v-if="!id" />
  <RouterView v-else :id="id" />
</template>

<script setup>
import { provideDocuments } from '@/composables/useDocuments.js'

defineProps({
  id: {
    type: String,
    default: undefined,
  },
})

provideDocuments()
</script>

<template>
  <DocumentsHome v-if="!id" />
  <DocumentsCreate v-else-if="id === 'create'" />
  <DocumentsPageId v-else :id="id" :key="id" />
</template>

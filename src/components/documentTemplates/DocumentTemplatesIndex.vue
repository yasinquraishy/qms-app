<script setup>
import { provideDocumentTemplates } from '@/composables/useDocumentTemplates.js'

defineProps({
  id: {
    type: String,
    default: undefined,
  },
})

const route = useRoute()
const mode = computed(() => route.query.mode)

provideDocumentTemplates()
</script>

<template>
  <DocumentTemplatesHome v-if="!id" />
  <DocumentTemplatesCreate v-else-if="id === 'create' || mode === 'edit'" :id="id" />
  <DocumentTemplatesPageId v-else :id="id" />
</template>

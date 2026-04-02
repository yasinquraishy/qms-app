<script setup>
import { provideFormTemplates } from '@/composables/useFormTemplates.js'

const props = defineProps({
  id: {
    type: String,
    default: undefined,
  },
})

provideFormTemplates()
</script>

<template>
  <FormTemplatePageId v-if="props.id" :id="props.id" />
  <FormTemplatesHome v-else />
</template>

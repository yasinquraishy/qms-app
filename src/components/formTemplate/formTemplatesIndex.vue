<script setup>
const props = defineProps({
  id: {
    type: String,
    default: undefined,
  },
})
</script>

<template>
  <FormTemplatePageId v-if="props.id" :id="props.id" />
  <FormTemplatesHome v-else />
</template>

<script setup>
const props = defineProps({
  id: {
    type: String,
    default: undefined,
  },
})
</script>

<template>
  <NcWorkflowTemplateEditor v-if="props.id" :id="props.id" />
  <NcWorkflowTemplatesHome v-else />
</template>

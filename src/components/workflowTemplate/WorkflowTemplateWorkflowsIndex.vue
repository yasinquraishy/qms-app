<script setup>
const props = defineProps({
  id: {
    type: String,
    default: undefined,
  },
})
</script>

<template>
  <WorkflowTemplateEditor v-if="props.id" :id="props.id" />
  <WorkflowTemplatesHome v-else />
</template>

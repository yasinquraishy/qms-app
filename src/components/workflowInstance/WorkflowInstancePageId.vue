<script setup>
const props = defineProps({
  id: { type: String, required: true },
})
</script>

<template>
  <WorkflowInstanceDetailView :instanceId="props.id" />
</template>

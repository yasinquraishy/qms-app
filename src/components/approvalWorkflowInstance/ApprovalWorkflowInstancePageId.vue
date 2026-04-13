<script setup>
const props = defineProps({
  id: { type: String, required: true },
})
</script>

<template>
  <ApprovalWorkflowInstanceDetailView :instanceId="props.id" />
</template>

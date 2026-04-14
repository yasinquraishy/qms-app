<script setup>
const props = defineProps({
  id: { type: String, default: null },
})
</script>

<template>
  <ApprovalWorkflowInstancePageId v-if="props.id" :id="props.id" />
  <ApprovalWorkflowInstancesHome v-else />
</template>

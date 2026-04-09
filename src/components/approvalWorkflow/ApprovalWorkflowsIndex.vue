<script setup>
const props = defineProps({
  id: {
    type: String,
    default: undefined,
  },
})
</script>

<template>
  <ApprovalWorkflowEditor v-if="props.id" :id="props.id" />
  <ApprovalWorkflowsHome v-else />
</template>

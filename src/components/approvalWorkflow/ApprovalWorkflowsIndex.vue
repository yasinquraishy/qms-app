<script setup>
import { provideApprovalWorkflows } from '@/composables/useApprovalWorkflows.js'

const props = defineProps({
  id: {
    type: String,
    default: undefined,
  },
})

provideApprovalWorkflows()
</script>

<template>
  <ApprovalWorkflowEditor v-if="props.id" :id="props.id" />
  <ApprovalWorkflowsHome v-else />
</template>

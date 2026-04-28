<script setup>
const props = defineProps({
  id: { type: String, default: null },
})
</script>

<template>
  <WorkflowInstancePageId v-if="props.id" :id="props.id" />
  <WorkflowInstancesHome v-else />
</template>

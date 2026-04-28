<script setup>
const props = defineProps({
  id: {
    type: String,
    default: undefined,
  },
})
</script>

<template>
  <WorkflowEditor v-if="props.id" :id="props.id" />
  <WorkflowsHome v-else />
</template>

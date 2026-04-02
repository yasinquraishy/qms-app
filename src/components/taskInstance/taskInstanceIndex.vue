<script setup>
const props = defineProps({
  id: { type: String, default: null },
})

provideTaskInstances()
</script>

<template>
  <TaskInstancePageId v-if="props.id" :id="props.id" />
  <TaskInstancesHome v-else />
</template>

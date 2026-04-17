<script setup>
defineProps({
  id: {
    type: String,
    default: undefined,
  },
})
</script>

<template>
  <NcRecordsHome v-if="!id" />
  <RouterView v-else :id="id" />
</template>

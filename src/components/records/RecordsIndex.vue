<script setup>
defineProps({
  id: {
    type: String,
    default: undefined,
  },
})
</script>

<template>
  <RecordsHome v-if="!id" />
  <RouterView v-else :id="id" />
</template>

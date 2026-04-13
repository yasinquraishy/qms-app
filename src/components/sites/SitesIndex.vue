<script setup>
defineProps({
  id: {
    type: String,
    default: undefined,
  },
})
</script>

<template>
  <SitesHome v-if="!id" />
  <RouterView v-else :id="id" />
</template>

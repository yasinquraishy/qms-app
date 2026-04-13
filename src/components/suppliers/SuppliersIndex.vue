<script setup>
defineProps({
  id: {
    type: String,
    default: undefined,
  },
})
</script>

<template>
  <SuppliersCreate v-if="id === 'create'" />
  <SuppliersPageId v-else-if="id" :id="id" :key="id" />
  <SuppliersHome v-else />
</template>

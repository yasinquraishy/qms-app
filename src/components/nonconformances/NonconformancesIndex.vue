<script setup>
defineProps({
  id: {
    type: String,
    default: undefined,
  },
})
</script>

<template>
  <NonconformancesCreate v-if="id === 'create'" />
  <NonconformancesPageId v-else-if="id" :id="id" :key="id" />
  <NonconformancesHome v-else />
</template>

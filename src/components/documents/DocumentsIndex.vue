<script setup>
defineProps({
  id: {
    type: String,
    default: undefined,
  },
})
</script>

<template>
  <DocumentsHome v-if="!id" />
  <DocumentsCreate v-else-if="id === 'create'" />
  <DocumentsPageId v-else :id="id" :key="id" />
</template>

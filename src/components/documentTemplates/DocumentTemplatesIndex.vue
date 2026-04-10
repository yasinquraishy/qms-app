<script setup>
defineProps({
  id: {
    type: String,
    default: undefined,
  },
})

const route = useRoute()
const mode = computed(() => route.query.mode)
</script>

<template>
  <DocumentTemplatesHome v-if="!id" />
  <DocumentTemplatesCreate v-else-if="id === 'create' || mode === 'edit'" :id="id" />
  <DocumentTemplatesPageId v-else :id="id" />
</template>

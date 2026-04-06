<script setup>
import documentTypeBadge from './documentTypeBadge.vue'

const props = defineProps({
  documentTypeId: {
    type: String,
    required: true,
  },
})

const documentType = computed(() => ({
  id: props.documentTypeId,
}))
</script>

<template>
  <documentTypeBadge :documentType="documentType" />
</template>

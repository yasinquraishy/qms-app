<script setup>
defineProps({
  required: { type: Boolean, default: false },
  multiple: { type: Boolean, default: false },
})

const relatedStandardId = defineModel('relatedStandardId', {
  type: [String, null, Array],
  default: null,
})
</script>

<template>
  <RelatedStandardSelectMenu v-model="relatedStandardId" v-bind="$attrs" />
</template>

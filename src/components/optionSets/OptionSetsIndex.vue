<script setup>
const props = defineProps({
  id: {
    type: String,
    default: undefined,
  },
})
</script>

<template>
  <OptionSetsPageId v-if="props.id" :id="props.id" />
  <OptionSetsHome v-else />
</template>

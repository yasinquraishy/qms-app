<script setup>
import { provideOptionSets } from '@/composables/useOptionSets.js'

const props = defineProps({
  id: {
    type: String,
    default: undefined,
  },
})

provideOptionSets()
</script>

<template>
  <OptionSetsPageId v-if="props.id" :id="props.id" />
  <OptionSetsHome v-else />
</template>

<script setup>
import { provideSuppliers } from '@/composables/useSuppliers.js'

defineProps({
  id: {
    type: String,
    default: undefined,
  },
})

const route = useRoute()
const mode = computed(() => route.query.mode)

provideSuppliers()
</script>

<template>
  <SuppliersCreate v-if="id === 'create' || mode === 'edit'" :id="id" />
  <SuppliersPageId v-else-if="id" :id="id" :key="id" />
  <SuppliersHome v-else />
</template>

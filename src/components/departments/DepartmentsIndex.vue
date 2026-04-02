<script setup>
import { provideDepartments } from '@/composables/useDepartments.js'

defineProps({
  id: {
    type: String,
    default: undefined,
  },
})

provideDepartments()
</script>

<template>
  <DepartmentsHome v-if="!id" />
  <RouterView v-else :id="id" />
</template>

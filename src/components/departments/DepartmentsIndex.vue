<script setup>
defineProps({
  id: {
    type: String,
    default: undefined,
  },
})
</script>

<template>
  <DepartmentsHome v-if="!id" />
  <RouterView v-else :id="id" />
</template>

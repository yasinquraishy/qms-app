<script setup>
defineProps({
  required: { type: Boolean, default: false },
  multiple: { type: Boolean, default: false },
})

const departmentId = defineModel('departmentId', {
  type: [String, null, Array],
  default: null,
})
</script>

<template>
  <DepartmentSelectMenu v-model="departmentId" v-bind="$attrs" />
</template>

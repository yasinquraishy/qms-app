<script setup>
defineProps({
  department: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <span
    class="tw:bg-primary/10 tw:text-primary tw:text-sm tw:font-medium tw:mr-2 tw:px-2.5 tw:py-1 tw:rounded-md"
  >
    {{ department.name }}
  </span>
</template>

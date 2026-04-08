<script setup>
defineProps({
  documentTemplate: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <span
    class="tw:text-sm tw:font-medium tw:mr-2 tw:px-2.5 tw:py-1 tw:rounded-md tw:border tw:border-divider"
  >
    {{ documentTemplate.name }}
  </span>
</template>

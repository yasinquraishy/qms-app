<script setup>
const color = defineModel({
  type: String,
  default: '#2563eb',
})
</script>

<template>
  <input
    v-model="color"
    type="color"
    class="tw:w-[50px] tw:h-[30px] tw:rounded tw:border tw:border-divider tw:cursor-pointer tw:p-0.5 tw:hover:border-primary tw:hover:shadow-sm tw:transition-all"
  />
</template>

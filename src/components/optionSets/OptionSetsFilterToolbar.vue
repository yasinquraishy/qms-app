<script setup>
const filters = defineModel('filters', {
  type: Object,
  required: true,
})
</script>

<template>
  <div class="tw:flex tw:mb-2">
    <WInput
      v-model="filters.search"
      placeholder="Search option sets..."
      dense
      class="tw:w-full tw:md:w-1/3"
    >
      <template #prepend>
        <WIcon name="search" />
      </template>
    </WInput>
  </div>
</template>

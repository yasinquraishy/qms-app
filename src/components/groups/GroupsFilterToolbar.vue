<script setup>
const filters = defineModel('filters', {
  type: Object,
  required: true,
})
</script>

<template>
  <WCard flat class="tw:bg-main-hover tw:mb-2">
    <div class="tw:flex tw:items-center tw:p-2 tw:gap-2">
      <!-- Search -->
      <div class="tw:w-full tw:md:w-1/3">
        <WInput
          v-model="filters.search"
          placeholder="Search groups..."
          dense
          bgColor="white"
          hideBottomSpace
          clearable
        >
          <template #prepend>
            <WIcon name="search" color="grey-6" />
          </template>
        </WInput>
      </div>

      <QSpace />

      <!-- Active Filters Summary (Optional) -->
      <div class="tw:flex-none">
        <div class="tw:flex tw:items-center tw:gap-2">
          <!-- Add more filters here if needed -->
        </div>
      </div>
    </div>
  </WCard>
</template>

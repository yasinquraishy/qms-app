<script setup>
import { IconSearch } from '@tabler/icons-vue'

const filters = defineModel('filters', {
  type: Object,
  required: true,
})
</script>

<template>
  <div class="tw:bg-main-hover tw:mb-2 tw:rounded-lg">
    <div class="tw:flex tw:items-center tw:p-2 tw:gap-2">
      <!-- Search -->
      <div class="tw:w-full tw:md:w-1/3">
        <BaseTextInput v-model="filters.search" placeholder="Search records...">
          <template #icon>
            <IconSearch :size="16" class="tw:text-secondary tw:mr-1" />
          </template>
        </BaseTextInput>
      </div>

      <div class="tw:flex-1"></div>

      <!-- Active Filters Summary (Optional) -->
      <div class="tw:flex-none">
        <div class="tw:flex tw:items-center tw:gap-2">
          <!-- Add more filters here if needed -->
        </div>
      </div>
    </div>
  </div>
</template>

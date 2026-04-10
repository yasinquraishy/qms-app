<script setup>
import { IconSearch } from '@tabler/icons-vue'

const filters = defineModel('filters', {
  type: Object,
  required: true,
})
</script>

<template>
  <div class="tw:flex tw:mb-2">
    <BaseTextInput
      v-model="filters.search"
      name="search"
      placeholder="Search option sets..."
      clearBtn
      class="tw:w-full tw:md:w-1/3"
    >
      <template #icon>
        <IconSearch :size="16" />
      </template>
    </BaseTextInput>
  </div>
</template>

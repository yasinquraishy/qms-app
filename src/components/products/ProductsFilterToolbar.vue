<script setup>
import { IconSearch } from '@tabler/icons-vue'

const filters = defineModel('filters', {
  type: Object,
  required: true,
})
</script>

<template>
  <div class="tw:bg-main-hover tw:mb-2">
    <div class="tw:flex tw:items-center tw:p-2 tw:gap-2">
      <div class="tw:w-full tw:md:w-1/3">
        <BaseTextInput
          v-model="filters.search"
          name="search"
          placeholder="Search products..."
          clearBtn
        >
          <template #icon>
            <IconSearch :size="16" />
          </template>
        </BaseTextInput>
      </div>

      <div class="tw:w-full tw:md:w-1/5">
        <ProductTypeSelectMenu v-model="filters.productTypeId" :required="false" />
      </div>

      <div class="tw:w-full tw:md:w-1/5">
        <ProductStatusSelectMenu v-model="filters.statusId" :required="false" />
      </div>
    </div>
  </div>
</template>

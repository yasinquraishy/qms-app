<script setup>
import { IconSearch } from '@tabler/icons-vue'

const filters = defineModel('filters', {
  type: Object,
  required: true,
})
</script>

<template>
  <div class="tw:bg-main-hover tw:rounded-lg tw:mb-2">
    <div class="tw:flex tw:items-center tw:p-2 tw:gap-2 tw:flex-wrap">
      <div class="tw:w-full tw:md:w-1/4 tw:relative">
        <IconSearch
          :size="16"
          class="tw:absolute tw:left-2 tw:top-1/2 tw:-translate-y-1/2 tw:text-secondary tw:pointer-events-none"
        />
        <BaseTextInput v-model="filters.search" placeholder="Search suppliers..." class="tw:pl-7" />
      </div>

      <div class="tw:w-full tw:md:w-1/6">
        <SupplierStatusSelectMenu v-model="filters.statusId" />
      </div>

      <div class="tw:w-full tw:md:w-1/6">
        <SupplierCategorySelectMenu v-model="filters.category" />
      </div>

      <div class="tw:w-full tw:md:w-1/6">
        <SupplierRiskLevelSelectMenu v-model="filters.riskLevel" />
      </div>
    </div>
  </div>
</template>

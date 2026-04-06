<script setup>
defineProps({
  supplier: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <div class="tw:grid tw:grid-cols-12 tw:gap-6">
    <SuppliersBasicInfoCard :supplier="supplier" class="tw:col-span-12 tw:lg:col-span-8" />
    <SuppliersRiskCard :supplier="supplier" class="tw:col-span-12 tw:lg:col-span-4" />
    <SuppliersContactCard :supplier="supplier" class="tw:col-span-12" />
    <SuppliersAssociatedSitesCard :supplier="supplier" class="tw:col-span-12" />
  </div>
</template>

<script setup>
defineProps({
  supplier: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <div
    class="tw:bg-sidebar tw:rounded-xl tw:shadow-sm tw:border tw:border-divider tw:overflow-hidden"
  >
    <div
      class="tw:px-6 tw:py-4 tw:border-b tw:border-divider tw:bg-main-hover tw:flex tw:items-center tw:gap-3"
    >
      <div
        class="tw:w-10 tw:h-10 tw:rounded-lg tw:bg-gray-100 tw:flex tw:items-center tw:justify-center"
      >
        <QIcon name="analytics" class="tw:text-secondary" size="sm" />
      </div>
      <h3 class="tw:text-lg tw:font-bold tw:text-on-main">Evaluations</h3>
    </div>
    <div class="tw:py-12 tw:text-center">
      <QIcon name="analytics" size="40px" class="tw:text-secondary/50 tw:mb-2" />
      <p class="tw:text-secondary tw:text-sm">No evaluations available for this supplier.</p>
    </div>
  </div>
</template>

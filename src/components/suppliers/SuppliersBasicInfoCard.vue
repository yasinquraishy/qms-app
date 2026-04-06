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
        class="tw:w-10 tw:h-10 tw:rounded-lg tw:bg-primary/10 tw:flex tw:items-center tw:justify-center"
      >
        <QIcon name="info" color="primary" size="sm" />
      </div>
      <h3 class="tw:text-lg tw:font-bold tw:text-on-main">Basic Information</h3>
    </div>
    <div class="tw:p-6 tw:grid tw:grid-cols-1 tw:md:grid-cols-2 tw:gap-y-6 tw:gap-x-12">
      <div>
        <label class="ds-label-sm tw:text-secondary tw:block tw:mb-1">Supplier Code</label>
        <p class="tw:text-sm tw:font-medium tw:text-on-main">{{ supplier.code }}</p>
      </div>
      <div>
        <label class="ds-label-sm tw:text-secondary tw:block tw:mb-1">Category</label>
        <p class="tw:text-sm tw:font-medium tw:text-on-main">{{ supplier.category || '—' }}</p>
      </div>
      <div>
        <label class="ds-label-sm tw:text-secondary tw:block tw:mb-1">Created Date</label>
        <p class="tw:text-sm tw:font-medium tw:text-on-main">
          {{ supplier.createdAt?.formatDate('date') || '—' }}
        </p>
      </div>
      <div>
        <label class="ds-label-sm tw:text-secondary tw:block tw:mb-1">Country</label>
        <p class="tw:text-sm tw:font-medium tw:text-on-main">{{ supplier.country || '—' }}</p>
      </div>
    </div>
  </div>
</template>

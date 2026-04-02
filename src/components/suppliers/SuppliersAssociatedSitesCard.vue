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
        <QIcon name="location_on" color="primary" size="sm" />
      </div>
      <h3 class="tw:text-lg tw:font-bold tw:text-on-main">Associated Sites</h3>
    </div>
    <div class="tw:p-6">
      <div v-if="supplier.sites?.length" class="tw:flex tw:flex-wrap tw:gap-2">
        <QChip
          v-for="site in supplier.sites"
          :key="site.id"
          icon="location_on"
          color="primary"
          textColor="white"
          dense
        >
          {{ site.name }} ({{ site.code }})
        </QChip>
      </div>
      <div v-else class="tw:text-sm tw:text-secondary tw:italic">No sites assigned</div>
    </div>
  </div>
</template>

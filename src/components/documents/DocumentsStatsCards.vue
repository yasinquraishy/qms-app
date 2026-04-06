<script setup>
defineProps({
  stats: {
    type: Array,
    default: () => [],
  },
  total: {
    type: Number,
    default: 0,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const iconMap = {
  DRAFT: 'edit_note',
  IN_REVIEW: 'rate_review',
  APPROVED: 'check_circle',
  EFFECTIVE: 'verified',
  OBSOLETE: 'archive',
  ARCHIVED: 'inventory_2',
}

const colorMap = {
  DRAFT: 'tw:text-gray-500',
  IN_REVIEW: 'tw:text-orange-500',
  APPROVED: 'tw:text-green-600',
  EFFECTIVE: 'tw:text-blue-600',
  OBSOLETE: 'tw:text-gray-400',
  ARCHIVED: 'tw:text-gray-400',
}

function getIcon(statusId) {
  return iconMap[statusId] || 'description'
}

function getColorClass(statusId) {
  return colorMap[statusId] || 'tw:text-gray-500'
}
</script>

<template>
  <div class="tw:grid tw:grid-cols-2 tw:md:grid-cols-4 tw:xl:grid-cols-6 tw:gap-3">
    <!-- Total Card -->
    <WCard flat class="tw:p-4">
      <div class="tw:flex tw:items-center tw:gap-3">
        <div class="tw:bg-primary/10 tw:rounded-lg tw:p-2">
          <WIcon name="folder" size="24px" class="tw:text-primary" />
        </div>
        <div>
          <div class="tw:text-2xl tw:font-bold tw:text-on-sidebar">{{ total }}</div>
          <div class="tw:text-xs tw:text-secondary">Total</div>
        </div>
      </div>
    </WCard>

    <!-- Status Cards -->
    <WCard v-for="stat in stats" :key="stat.id" flat class="tw:p-4">
      <div class="tw:flex tw:items-center tw:gap-3">
        <div class="tw:bg-main-hover tw:rounded-lg tw:p-2">
          <WIcon :name="getIcon(stat.id)" size="24px" :class="getColorClass(stat.id)" />
        </div>
        <div>
          <div class="tw:text-2xl tw:font-bold tw:text-on-sidebar">{{ stat.count }}</div>
          <div class="tw:text-xs tw:text-secondary">{{ stat.name }}</div>
        </div>
      </div>
    </WCard>
  </div>
</template>

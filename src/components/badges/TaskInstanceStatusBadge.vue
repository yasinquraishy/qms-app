<script setup>
const props = defineProps({
  status: { type: String, default: '' },
  showDot: { type: Boolean, default: false },
  hideLabel: { type: Boolean, default: false },
})

const statusConfig = {
  APPROVED: { label: 'Approved', color: 'emerald', class: 'tw:text-emerald-600 tw:bg-emerald-50' },
  REJECTED: { label: 'Rejected', color: 'red', class: 'tw:text-red-600 tw:bg-red-50' },
  CHANGES_REQUESTED: {
    label: 'Changes Requested',
    color: 'orange',
    class: 'tw:text-orange-600 tw:bg-orange-50',
  },
  PENDING: { label: 'Pending', color: 'amber', class: 'tw:text-amber-600 tw:bg-amber-50' },
  IN_PROGRESS: { label: 'In Progress', color: 'amber', class: 'tw:text-amber-600 tw:bg-amber-50' },
  CANCELLED: { label: 'Cancelled', color: 'red', class: 'tw:text-red-600 tw:bg-red-50' },
}

const config = computed(() => {
  return statusConfig[props.status] || statusConfig.PENDING
})
</script>

<template>
  <span
    class="tw:text-xs tw:font-medium"
    :class="[config.class, showDot && hideLabel ? 'tw:rounded-full' : 'tw:rounded tw:px-2 tw:py-1']"
  >
    <template v-if="showDot">
      <span
        class="tw:inline-block tw:size-2 tw:rounded-full tw:mr-1"
        :class="{
          'tw:bg-emerald-500': config.color === 'emerald',
          'tw:bg-amber-500': config.color === 'amber',
          'tw:bg-red-500': config.color === 'red',
          'tw:bg-orange-500': config.color === 'orange',
        }"
      ></span>
    </template>

    <template v-if="!hideLabel">{{ config.label }}</template>
  </span>
</template>

<script setup>
const props = defineProps({
  status: { type: String, default: '' },
})

const statusConfig = {
  APPROVED: { label: 'Completed', color: 'emerald', class: 'tw:text-emerald-600' },
  IN_PROGRESS: { label: 'Active', color: 'primary', class: 'tw:text-primary' },
  REJECTED: { label: 'Rejected', color: 'red', class: 'tw:text-red-600' },
  CHANGES_REQUESTED: { label: 'Changes Requested', color: 'orange', class: 'tw:text-orange-600' },
  CANCELLED: { label: 'Cancelled', color: 'gray', class: 'tw:text-gray-600' },
  ASSIGNED: { label: 'Assigned', color: 'blue', class: 'tw:text-blue-600' },
  DEFAULT: { label: 'Waiting', color: 'secondary', class: 'tw:text-secondary' },
}

const config = computed(() => {
  return statusConfig[props.status] || statusConfig.DEFAULT
})
</script>

<template>
  <span class="tw:text-xs tw:font-bold tw:uppercase tw:tracking-wider" :class="config.class">
    {{ config.label }}
  </span>
</template>

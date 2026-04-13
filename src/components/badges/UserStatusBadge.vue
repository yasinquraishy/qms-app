<script setup>
defineProps({
  statusId: {
    type: String,
    default: null,
  },
})

const STATUS_MAP = {
  ACTIVE: { label: 'Active', class: 'tw:bg-green-100 tw:text-green-700' },
  INACTIVE: { label: 'Inactive', class: 'tw:bg-gray-100 tw:text-gray-600' },
  INVITED: { label: 'Invited', class: 'tw:bg-blue-100 tw:text-blue-700' },
}
</script>

<template>
  <BaseBadge v-bind="$attrs" :class="STATUS_MAP[statusId]?.class">
    {{ STATUS_MAP[statusId]?.label || statusId || '—' }}
  </BaseBadge>
</template>

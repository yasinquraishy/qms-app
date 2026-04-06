<script setup>
const props = defineProps({
  status: {
    type: String,
    default: '',
  },
  version: {
    type: String,
    default: '',
  },
})

const colors = {
  ACTIVE:
    'tw:bg-green-100 tw:text-green-700 tw:dark:bg-green-900/30 tw:dark:text-green-400 tw:border-green-200 tw:dark:border-green-800',
  DRAFT:
    'tw:bg-blue-100 tw:text-blue-700 tw:dark:bg-blue-900/30 tw:dark:text-blue-400 tw:border-blue-200 tw:dark:border-blue-800',
  REVIEW:
    'tw:bg-yellow-100 tw:text-yellow-700 tw:dark:bg-yellow-900/30 tw:dark:text-yellow-400 tw:border-yellow-200 tw:dark:border-yellow-800',
  APPROVED:
    'tw:bg-green-100 tw:text-green-700 tw:dark:bg-green-900/30 tw:dark:text-green-400 tw:border-green-200 tw:dark:border-green-800',
  EFFECTIVE:
    'tw:bg-green-100 tw:text-green-700 tw:dark:bg-green-900/30 tw:dark:text-green-400 tw:border-green-200 tw:dark:border-green-800',
  REJECTED:
    'tw:bg-red-100 tw:text-red-700 tw:dark:bg-red-900/30 tw:dark:text-red-400 tw:border-red-200 tw:dark:border-red-800',
  OBSOLETE:
    'tw:bg-gray-100 tw:text-gray-700 tw:dark:bg-gray-900/30 tw:dark:text-gray-400 tw:border-gray-200 tw:dark:border-gray-800',
  ARCHIVED:
    'tw:bg-gray-100 tw:text-gray-700 tw:dark:bg-gray-900/30 tw:dark:text-gray-400 tw:border-gray-200 tw:dark:border-gray-800',
  CHANGES_REQUESTED:
    'tw:bg-orange-100 tw:text-orange-700 tw:dark:bg-orange-900/30 tw:dark:text-orange-400 tw:border-orange-200 tw:dark:border-orange-800',
}

const statusConfig = {
  ACTIVE: { color: colors.ACTIVE, icon: 'check_circle', label: 'Active' },
  DRAFT: { color: colors.DRAFT, icon: 'edit_note', label: 'Draft' },
  IN_REVIEW: { color: colors.REVIEW, icon: 'rate_review', label: 'In Review' },
  APPROVED: { color: colors.APPROVED, icon: 'check_circle', label: 'Approved' },
  REJECTED: { color: colors.REJECTED, icon: 'cancel', label: 'Rejected' },
  EFFECTIVE: { color: colors.EFFECTIVE, icon: 'verified', label: 'Effective' },
  OBSOLETE: { color: colors.OBSOLETE, icon: 'archive', label: 'Obsolete' },
  ARCHIVED: { color: colors.ARCHIVED, icon: 'inventory_2', label: 'Archived' },
  CHANGES_REQUESTED: {
    color: colors.CHANGES_REQUESTED,
    icon: 'edit_note',
    label: 'Changes Requested',
  },
}

const config = computed(() => {
  return (
    statusConfig[props.status] || {
      color:
        'tw:bg-gray-100 tw:text-gray-700 tw:dark:bg-gray-900/30 tw:dark:text-gray-400 tw:border-gray-200 tw:dark:border-gray-800',
      icon: 'help',
      label: props.status,
    }
  )
})
</script>

<template>
  <span
    :class="[
      config.color,
      'tw:text-[10px] tw:font-bold tw:uppercase tw:tracking-widest tw:px-2 tw:py-1 tw:rounded tw:border',
    ]"
  >
    <WIcon :name="config.icon" size="14px" class="tw:mr-1" />
    <span v-if="props.version" class="tw-mr-1">v{{ props.version }}</span>
    {{ config.label }}
  </span>
</template>

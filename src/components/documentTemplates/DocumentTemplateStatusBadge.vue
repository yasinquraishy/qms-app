<script setup>
const props = defineProps({
  status: {
    type: [Object, String],
    required: true,
  },
  showDot: {
    type: Boolean,
    default: true,
  },
})

const statusId = computed(() => {
  return typeof props.status === 'string' ? props.status : props.status?.id
})

const statusName = computed(() => {
  if (typeof props.status === 'object' && props.status?.name) {
    return props.status.name
  }
  return statusId.value
})

const badgeClass = computed(() => {
  const classes = {
    ACTIVE: 'tw:bg-green-100 tw:text-green-700',
    DRAFT: 'tw:bg-amber-100 tw:text-amber-700',
    ARCHIVE: 'tw:bg-gray-100 tw:text-gray-500',
    ARCHIVED: 'tw:bg-gray-100 tw:text-gray-500',
    INACTIVE: 'tw:bg-gray-100 tw:text-gray-500',
  }
  return classes[statusId.value] || 'tw:bg-gray-100 tw:text-gray-500'
})

const statusDotClass = computed(() => {
  const classes = {
    ACTIVE: 'tw:bg-green-600',
    DRAFT: 'tw:bg-amber-600',
    ARCHIVE: 'tw:bg-gray-500',
    ARCHIVED: 'tw:bg-gray-500',
    INACTIVE: 'tw:bg-gray-500',
  }
  return classes[statusId.value] || 'tw:bg-gray-500'
})
</script>

<template>
  <span
    class="tw:inline-flex tw:items-center tw:gap-1 tw:px-2 tw:py-1 tw:text-xs tw:font-medium tw:rounded-full"
    :class="badgeClass"
  >
    <span
      v-if="showDot"
      class="tw:rounded-full tw:w-1.5 tw:h-1.5 tw:shrink-0"
      :class="statusDotClass"
    />
    {{ statusName }}
  </span>
</template>

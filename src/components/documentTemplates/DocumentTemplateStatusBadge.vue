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

const statusColor = computed(() => {
  const colors = {
    ACTIVE: 'green',
    DRAFT: 'amber',
    ARCHIVE: 'grey',
    ARCHIVED: 'grey',
    INACTIVE: 'grey',
  }
  return colors[statusId.value] || 'grey'
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
  <QBadge
    :color="`${statusColor}-1`"
    :textColor="`${statusColor}-${statusColor === 'amber' ? '9' : '8'}`"
    class="tw:px-2 tw:py-1 tw:text-xs tw:font-medium tw:flex tw:items-center tw:gap-1"
    rounded
  >
    <div
      v-if="showDot"
      class="tw:rounded-full"
      :class="statusDotClass"
      style="width: 6px; height: 6px"
    />
    {{ statusName }}
  </QBadge>
</template>

<script setup>
const props = defineProps({
  status: {
    type: Object,
    required: true,
  },
  showDot: {
    type: Boolean,
    default: true,
  },
})

const statusColor = computed(() => {
  const colors = {
    ACTIVE: 'green',
    DRAFT: 'amber',
    ARCHIVED: 'grey',
    INACTIVE: 'grey',
  }
  return colors[props.status.id] || 'grey'
})

const statusDotClass = computed(() => {
  const classes = {
    ACTIVE: 'bg-positive',
    DRAFT: 'bg-warning',
    ARCHIVED: 'bg-grey',
    INACTIVE: 'bg-grey',
  }
  return classes[props.status.id] || 'bg-grey'
})
</script>

<template>
  <QBadge
    :color="`${statusColor}-1`"
    :textColor="`${statusColor}-${statusColor === 'amber' ? '9' : '8'}`"
    class="q-px-sm q-py-xs text-caption font-medium row items-center gap-1"
    rounded
  >
    <div v-if="showDot" class="rounded-full" :class="statusDotClass" style="width: 6px; height: 6px" />
    {{ status.id }}
  </QBadge>
</template>

<style scoped lang="scss">
.gap-1 {
  gap: 4px;
}
.font-medium {
  font-weight: 500;
}
</style>

<script setup>
const props = defineProps({
  documentType: {
    type: Object,
    required: true,
  },
  iconOnly: {
    type: Boolean,
    default: true,
  },
  size: {
    type: String,
    default: '48px',
  },
})

const documentTypeConfig = computed(() => {
  const configs = {
    CAPA: {
      color: 'orange',
      bgClass: 'tw:bg-orange-100 tw:dark:bg-orange-900/30',
      textClass: 'tw:text-orange-600 tw:dark:text-orange-400',
      icon: 'build',
    },
    NC: {
      color: 'purple',
      bgClass: 'tw:bg-purple-100 tw:dark:bg-purple-900/30',
      textClass: 'tw:text-purple-600 tw:dark:text-purple-400',
      icon: 'warning',
    },
    SOP: {
      color: 'blue',
      bgClass: 'tw:bg-blue-100 tw:dark:bg-blue-900/30',
      textClass: 'tw:text-blue-600 tw:dark:text-blue-400',
      icon: 'description',
    },
    AUDIT: {
      color: 'green',
      bgClass: 'tw:bg-green-100 tw:dark:bg-green-900/30',
      textClass: 'tw:text-green-600 tw:dark:text-green-400',
      icon: 'fact_check',
    },
  }
  return (
    configs[props.documentType.id] || {
      color: 'indigo',
      bgClass: 'tw:bg-indigo-100 tw:dark:bg-indigo-900/30',
      textClass: 'tw:text-indigo-600 tw:dark:text-indigo-400',
      icon: 'description',
    }
  )
})

const containerStyle = computed(() => ({
  width: props.size,
  height: props.size,
}))

const iconSize = computed(() => {
  // Calculate icon size as ~58% of container size
  const sizeNum = parseInt(props.size)
  return `${Math.round(sizeNum * 0.58)}px`
})
</script>

<template>
  <div
    v-if="iconOnly"
    class="tw:rounded-lg tw:flex tw:items-center tw:justify-center tw:shrink-0"
    :class="[documentTypeConfig.bgClass, documentTypeConfig.textClass]"
    :style="containerStyle"
  >
    <WIcon :icon="documentTypeConfig.icon" :size="iconSize" />
  </div>
  <div
    v-else
    class="tw:flex tw:items-center tw:gap-2 tw:px-3 tw:py-1.5 tw:rounded-full tw:w-fit"
    :class="[documentTypeConfig.bgClass, documentTypeConfig.textClass]"
  >
    <WIcon :icon="documentTypeConfig.icon" size="18px" />
    <span class="tw:text-sm tw:font-medium">{{ documentType.id }}</span>
  </div>
</template>

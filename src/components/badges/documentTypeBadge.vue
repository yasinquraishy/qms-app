<script setup>
import { IconTool, IconAlertTriangle, IconFileText, IconChecks } from '@tabler/icons-vue'

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
      icon: IconTool,
    },
    NC: {
      color: 'purple',
      bgClass: 'tw:bg-purple-100 tw:dark:bg-purple-900/30',
      textClass: 'tw:text-purple-600 tw:dark:text-purple-400',
      icon: IconAlertTriangle,
    },
    SOP: {
      color: 'blue',
      bgClass: 'tw:bg-blue-100 tw:dark:bg-blue-900/30',
      textClass: 'tw:text-blue-600 tw:dark:text-blue-400',
      icon: IconFileText,
    },
    AUDIT: {
      color: 'green',
      bgClass: 'tw:bg-green-100 tw:dark:bg-green-900/30',
      textClass: 'tw:text-green-600 tw:dark:text-green-400',
      icon: IconChecks,
    },
  }
  return (
    configs[props.documentType.id] || {
      color: 'indigo',
      bgClass: 'tw:bg-indigo-100 tw:dark:bg-indigo-900/30',
      textClass: 'tw:text-indigo-600 tw:dark:text-indigo-400',
      icon: IconFileText,
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
  return Math.round(sizeNum * 0.58)
})
</script>

<template>
  <div
    v-if="iconOnly"
    class="tw:rounded-md tw:flex tw:items-center tw:justify-center tw:shrink-0"
    :class="[documentTypeConfig.bgClass, documentTypeConfig.textClass]"
    :style="containerStyle"
  >
    <component :is="documentTypeConfig.icon" :size="iconSize" />
  </div>
  <BaseBadge
    v-else
    :class="[documentTypeConfig.bgClass, documentTypeConfig.textClass, 'tw:border-transparent']"
    v-bind="$attrs"
  >
    <template #icon>
      <component :is="documentTypeConfig.icon" :size="14" />
    </template>
    {{ documentType.name ?? documentType.id }}
  </BaseBadge>
</template>

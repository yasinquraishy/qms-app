<script setup>
// Props
defineProps({
  switches: {
    type: Array,
    required: true,
    validator: (value) => {
      return value.every((item) => item.icon && item.value)
    },
  },
})

// Model
const modelValue = defineModel({
  type: String,
  required: true,
})
</script>

<template>
  <div
    class="tw:flex tw:items-center tw:gap-1 tw:border tw:border-divider tw:rounded-lg tw:p-1 tw:bg-sidebar"
  >
    <WIcon
      v-for="switchItem in switches"
      :key="switchItem.value"
      :icon="switchItem.icon"
      size="20px"
      class="tw:cursor-pointer! tw:p-2 tw:rounded-md tw:transition-all tw:duration-200"
      :class="
        modelValue === switchItem.value
          ? 'tw:bg-primary tw:text-white'
          : 'tw:text-secondary tw:hover:bg-sidebar-hover tw:hover:text-on-sidebar'
      "
      @click="modelValue = switchItem.value"
    >
      <QTooltip v-if="switchItem.tooltip">{{ switchItem.tooltip }}</QTooltip>
    </WIcon>
  </div>
</template>

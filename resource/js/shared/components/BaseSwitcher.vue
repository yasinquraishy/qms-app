<script setup>
// Props
defineProps({
  switches: {
    type: Array,
    required: true,
    validator: (value) => {
      return value.every((item) => typeof item.icon === 'function' && item.value)
    },
  },
})

// Model
const modelValue = defineModel({
  type: String,
  required: true,
})

// TODO: need to use Poperover here for tooltip
</script>

<template>
  <div
    class="tw:flex tw:items-center tw:gap-1 tw:border tw:border-divider tw:rounded-lg tw:p-1 tw:bg-sidebar"
  >
    <component
      :is="switchItem.icon"
      v-for="switchItem in switches"
      :key="switchItem.value"
      size="20px"
      class="tw:cursor-pointer! tw:p-2 tw:rounded-md tw:transition-all tw:duration-200"
      :class="
        modelValue === switchItem.value
          ? 'tw:bg-primary tw:text-white'
          : 'tw:text-secondary tw:hover:bg-sidebar-hover tw:hover:text-on-sidebar'
      "
      :title="switchItem.tooltip || undefined"
      @click="modelValue = switchItem.value"
    />
  </div>
</template>

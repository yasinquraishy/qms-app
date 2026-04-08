<script setup>
import { IconX } from '@tabler/icons-vue'

defineProps({
  clearable: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['clear'])
</script>

<template>
  <div
    class="tw:text-sm tw:font-medium tw:mr-2 tw:px-2.5 tw:py-1 tw:rounded-md tw:border tw:border-divider tw:flex tw:items-center tw:w-fit"
  >
    <span v-if="$slots.icon" class="tw:mr-1">
      <slot name="icon" />
    </span>
    <slot />
    <span v-if="clearable" class="tw:ml-1 tw:text-red-500 tw:text-xs">
      <IconX class="tw:inline-block tw:size-4" @click.prevent.stop="emit('clear')" />
    </span>
  </div>
</template>

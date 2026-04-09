<script setup>
import { IconCheck, IconMinus } from '@tabler/icons-vue'

defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  indeterminate: {
    type: Boolean,
    default: false,
  },
})

const checked = defineModel({
  type: Boolean,
  default: false,
})
</script>

<template>
  <label
    class="tw:inline-flex tw:items-center tw:gap-2 tw:cursor-pointer tw:select-none"
    :class="disabled ? 'tw:opacity-50 tw:cursor-not-allowed tw:pointer-events-none' : ''"
  >
    <input
      v-model="checked"
      type="checkbox"
      class="tw:sr-only"
      :disabled="disabled"
      :indeterminate="indeterminate"
    />
    <span
      :class="[
        'tw:inline-flex tw:items-center tw:justify-center tw:h-4 tw:w-4 tw:shrink-0 tw:rounded tw:border tw:transition-colors tw:duration-150',
        checked || indeterminate
          ? 'tw:bg-primary tw:border-primary'
          : 'tw:bg-sidebar tw:border-divider',
      ]"
    >
      <IconMinus v-if="indeterminate" :size="10" class="tw:text-white" :stroke-width="3" />
      <IconCheck v-else-if="checked" :size="10" class="tw:text-white" :stroke-width="3" />
    </span>
    <span v-if="$slots.default" class="tw:text-sm tw:text-on-main">
      <slot />
    </span>
  </label>
</template>

<script setup>
import { DateTime } from 'luxon'

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
})

const modelValue = defineModel({
  type: [DateTime, null],
  default: null,
})

const timeInMins = computed({
  get() {
    if (!modelValue.value) return 0
    return modelValue.value.hour * 60 + modelValue.value.minute
  },
  set(newTimeInMins) {
    const hours = Math.floor(newTimeInMins / 60)
    const mins = newTimeInMins % 60
    const base = modelValue.value || DateTime.local()
    modelValue.value = base.set({ hour: hours, minute: mins, second: 0, millisecond: 0 })
  },
})
</script>

<template>
  <div class="tw:flex tw:flex-nowrap tw:gap-3">
    <div class="tw:max-w-fit">
      <slot name="date-label" />
      <BaseDatePicker v-model="modelValue" :minDate="new Date()" :disabled="props.disabled" />
    </div>
    <div>
      <slot name="time-label" />
      <BaseTimePicker v-model:timeInMins="timeInMins" :disabled="props.disabled" />
    </div>
  </div>
</template>

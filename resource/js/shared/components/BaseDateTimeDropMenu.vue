<script setup>
import { DateTime } from 'luxon'

defineProps({
  minDate: {
    type: [Object, undefined],
    default: undefined,
  },
})

const emit = defineEmits(['close'])

const modelValue = defineModel({
  type: [DateTime, null],
  default: null,
})

const nativeDate = computed({
  get() {
    return modelValue.value?.toJSDate?.() ?? new Date()
  },
  set(val) {
    modelValue.value = val ? DateTime.fromJSDate(val) : null
  },
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
  <BasePopover placement="bottom-end">
    <template #button="{ open }">
      <slot name="button" :open="open" />
    </template>
    <template #content="{ open, close }">
      <div
        v-if="open"
        class="tw:p-4 tw:bg-sidebar tw:rounded-xl tw:border tw:border-divider tw:shadow-lg"
      >
        <div class="tw:flex tw:flex-col tw:gap-3">
          <BaseDatePickerDropMenuPanel v-model:selectedDate="nativeDate" :minDate="minDate" />
          <div class="tw:flex tw:border-t tw:border-divider tw:pt-3 tw:justify-between">
            <BaseTimePicker v-model:timeInMins="timeInMins" />
            <BaseButton
              variant="filter"
              @click="
                () => {
                  close()
                  emit('close')
                }
              "
            >
              Close
            </BaseButton>
          </div>
        </div>
      </div>
    </template>
  </BasePopover>
</template>

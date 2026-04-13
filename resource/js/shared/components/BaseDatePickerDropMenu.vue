<script setup>
const props = defineProps({
  firstDayOfWeek: {
    type: Number,
    default: 2,
  },
  minDate: {
    type: [Object, undefined],
    default: undefined,
  },
  maxDate: {
    type: [Object, undefined],
    default: undefined,
  },
  showShortcuts: {
    type: Boolean,
    default: true,
  },
})

const selectedDate = defineModel('selectedDate', {
  type: [Object, null],
  default: null,
})
</script>

<template>
  <BasePopover placement="bottom">
    <template #button="{ open }">
      <slot name="button" :open="open" />
    </template>
    <template #content="{ open, close }">
      <BaseDatePickerDropMenuPanel
        v-if="open"
        v-model:selectedDate="selectedDate"
        :firstDayOfWeek="props.firstDayOfWeek"
        :minDate="props.minDate"
        :maxDate="props.maxDate"
        :showShortcuts="props.showShortcuts"
        :close="close"
      />
    </template>
  </BasePopover>
</template>

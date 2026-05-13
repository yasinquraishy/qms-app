<script setup>
import { IconClock } from '@tabler/icons-vue'

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
})

const timeInMins = defineModel('timeInMins', {
  type: Number,
  default: 0,
})

const hours24 = computed({
  get() {
    const v = Number(timeInMins.value)
    return Math.floor(v / 60) % 24
  },
  set(newValue) {
    const v = Number(newValue)
    timeInMins.value = (timeInMins.value % 60) + v * 60
  },
})

const hours12 = computed({
  get() {
    const v = Math.floor(Number(timeInMins.value) / 60) % 12
    return v === 0 ? 12 : v
  },
  set(newValue) {
    let v = Number(newValue)
    if (amOrPm.value === 'pm') v += 12
    timeInMins.value = (timeInMins.value % 60) + v * 60
  },
})

const mins = computed({
  get() {
    return Math.round((Number(timeInMins.value) % 60) / 5) * 5
  },
  set(newValue) {
    const v = Number(newValue) % 60
    timeInMins.value = v + hours24.value * 60
  },
})

const amOrPm = computed({
  get() {
    return hours24.value < 12 ? 'am' : 'pm'
  },
  set(newValue) {
    if (newValue === 'am') hours24.value = hours24.value % 12
    else hours24.value = (hours24.value % 12) + 12
  },
})
</script>

<template>
  <div
    class="tw:flex tw:h-8 tw:items-center tw:overflow-hidden tw:text-nowrap tw:rounded-xl tw:border tw:border-divider tw:bg-transparent tw:text-sm tw:text-on-sidebar tw:transition-[border,background-color,color,opacity] tw:duration-300 tw:hover:text-primary tw:focus-within:border-primary tw:focus-within:ring-2 tw:focus-within:ring-primary/20"
  >
    <IconClock class="tw:ml-2 tw:size-4" />
    <select
      v-model="hours12"
      :disabled="props.disabled"
      class="tw:py-0! tw:h-full tw:cursor-pointer tw:bg-transparent! tw:text-center tw:text-sm tw:font-medium tw:text-on-sidebar tw:outline-none tw:border-0! tw:disabled:cursor-not-allowed"
    >
      <option value="1">1</option>
      <option value="2">2</option>
      <option value="3">3</option>
      <option value="4">4</option>
      <option value="5">5</option>
      <option value="6">6</option>
      <option value="7">7</option>
      <option value="8">8</option>
      <option value="9">9</option>
      <option value="10">10</option>
      <option value="11">11</option>
      <option value="12">12</option>
    </select>
    <span class="tw:text-secondary">:</span>
    <select
      v-model="mins"
      :disabled="props.disabled"
      class="tw:py-0! tw:h-full tw:cursor-pointer tw:bg-transparent! tw:text-center tw:text-sm tw:font-medium tw:text-on-sidebar tw:outline-none tw:border-0! tw:disabled:cursor-not-allowed"
    >
      <option value="0">00</option>
      <option value="5">05</option>
      <option value="10">10</option>
      <option value="15">15</option>
      <option value="20">20</option>
      <option value="25">25</option>
      <option value="30">30</option>
      <option value="35">35</option>
      <option value="40">40</option>
      <option value="45">45</option>
      <option value="50">50</option>
      <option value="55">55</option>
    </select>
    <select
      v-model="amOrPm"
      :disabled="props.disabled"
      class="tw:py-0! tw:h-full tw:cursor-pointer tw:bg-transparent! tw:text-center tw:text-sm tw:font-medium tw:text-on-sidebar tw:outline-none tw:border-0! tw:disabled:cursor-not-allowed"
    >
      <option value="am">am</option>
      <option value="pm">pm</option>
    </select>
  </div>
</template>

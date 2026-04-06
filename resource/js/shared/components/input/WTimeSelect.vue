<script setup>
import { computed } from 'vue'

const model = defineModel({ type: Number, default: 0 })

const hours = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
const minutes = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'))

function parseModel(val) {
  const total = val ?? 0
  const h = Math.floor(total / 60) % 12 || 12
  const m = Math.floor((total % 60) / 5) * 5
  const period = total >= 720 ? 'PM' : 'AM'
  return {
    hour: String(h).padStart(2, '0'),
    min: String(m).padStart(2, '0'),
    period,
  }
}

function setModel(hour, min, period) {
  model.value = (parseInt(hour) % 12) * 60 + parseInt(min) + (period === 'PM' ? 720 : 0)
}

const hour = computed({
  get() {
    return parseModel(model.value).hour
  },
  set(val) {
    setModel(val, min.value, period.value)
  },
})

const min = computed({
  get() {
    return parseModel(model.value).min
  },
  set(val) {
    setModel(hour.value, val, period.value)
  },
})

const period = computed({
  get() {
    return parseModel(model.value).period
  },
  set(val) {
    setModel(hour.value, min.value, val)
  },
})
</script>

<template>
  <div class="tw:inline-flex tw:items-center tw:gap-2">
    <select
      v-model="hour"
      class="tw:appearance-none tw:cursor-pointer tw:rounded-lg tw:border tw:border-gray-300 tw:bg-white tw:px-3 tw:py-1.5 tw:text-sm tw:font-medium tw:text-gray-700 tw:outline-none tw:transition tw:w-14 tw:text-center hover:tw:border-primary focus:tw:border-primary focus:tw:ring-2 focus:tw:ring-primary/20"
    >
      <option v-for="h in hours" :key="h" :value="h">{{ h }}</option>
    </select>
    <span class="tw:text-gray-400 tw:font-bold tw:select-none tw:text-base">:</span>
    <select
      v-model="min"
      class="tw:appearance-none tw:cursor-pointer tw:rounded-lg tw:border tw:border-gray-300 tw:bg-white tw:px-3 tw:py-1.5 tw:text-sm tw:font-medium tw:text-gray-700 tw:outline-none tw:transition tw:w-14 tw:text-center hover:tw:border-primary focus:tw:border-primary focus:tw:ring-2 focus:tw:ring-primary/20"
    >
      <option v-for="m in minutes" :key="m" :value="m">{{ m }}</option>
    </select>
    <select
      v-model="period"
      class="tw:appearance-none tw:cursor-pointer tw:rounded-lg tw:border tw:border-gray-300 tw:bg-white tw:px-3 tw:py-1.5 tw:text-sm tw:font-semibold tw:text-gray-700 tw:outline-none tw:transition tw:w-16 tw:text-center hover:tw:border-primary focus:tw:border-primary focus:tw:ring-2 focus:tw:ring-primary/20"
    >
      <option value="AM">AM</option>
      <option value="PM">PM</option>
    </select>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { date } from 'quasar'
import { formatDate } from '@/utils/formatters'

const props = defineProps({
  mask: {
    type: String,
    default: 'MM/DD/YYYY',
  },
  format: {
    type: String,
    default: 'YYYY-MM-DD',
  },
})

const emit = defineEmits(['change'])

const criteriaId = defineModel('criteriaId', {
  type: String,
  default: '2',
})

const startDate = defineModel('startDate', {
  type: String,
  default: '',
})

const endDate = defineModel('endDate', {
  type: String,
  default: '',
})

const startTime = defineModel('startTime', {
  type: String,
  default: '12:00:00 AM',
})

const endTime = defineModel('endTime', {
  type: String,
  default: '11:59:59 PM',
})

function resetToMonday(date) {
  const d = new Date(date) // Clone the original date
  const day = d.getDay() // 0 (Sun) to 6 (Sat)
  const diff = (day === 0 ? -6 : 1) - day // Adjust if Sunday
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0) // Optional: reset time to midnight
  return d
}

const options = ref([
  {
    value: '0',
    text: 'Yesterday',
    getRange: () => {
      const start = date.subtractFromDate(new Date(), { days: 1 })
      const end = date.subtractFromDate(new Date(), { days: 1 })

      return { start, end }
    },
  },
  {
    value: '1',
    text: 'Today',
    getRange: () => {
      const start = new Date()
      const end = new Date()

      return { start, end }
    },
  },
  {
    value: '2',
    text: 'Last Seven Days',
    getRange: () => {
      const start = date.subtractFromDate(new Date(), { days: 6 })
      const end = new Date()

      return { start, end }
    },
  },
  {
    value: '3',
    text: 'This Week(From Monday)',
    getRange: () => {
      const start = resetToMonday(new Date()) // 1 represents Monday
      const end = new Date()

      return { start, end }
    },
  },
  {
    value: '6',
    text: 'This Month',
    getRange: () => {
      const start = date.startOfDate(new Date(), 'month')
      const end = new Date()

      return { start, end }
    },
  },
  {
    value: '7',
    text: 'Last Month',
    getRange: () => {
      const start = date.startOfDate(date.subtractFromDate(new Date(), { month: 1 }), 'month')
      const end = date.endOfDate(date.subtractFromDate(new Date(), { month: 1 }), 'month')

      return { start, end }
    },
  },
  {
    value: '9',
    text: 'Within A Month',
    getRange: () => {
      const start = date.subtractFromDate(new Date(), { month: 1 })
      const end = new Date()

      return { start, end }
    },
  },
  {
    value: '10',
    text: 'Custom Range',
    getRange: () => {
      const start = ''
      const end = ''

      return { start, end }
    },
  },
])

const disable = computed(() => {
  return criteriaId.value !== '10'
})

watch(
  () => criteriaId.value,
  (newValue) => {
    if (newValue === '10') {
      return
    }

    const selectedOption = options.value.find((option) => option.value === newValue)
    if (selectedOption) {
      const { start, end } = selectedOption.getRange()

      startDate.value = formatDate(start, props.format)
      endDate.value = formatDate(end, props.format)
      startTime.value = '12:00:00 AM'
      endTime.value = '11:59:59 PM'
      emit('change', {
        startDate: startDate.value,
        endDate: endDate.value,
        startTime: startTime.value,
        endTime: endTime.value,
      })
    }
  },
  { immediate: true },
)

watch([startDate, endDate, startTime, endTime], () => {
  if (criteriaId.value === '10') {
    emit('change', {
      startDate: startDate.value,
      endDate: endDate.value,
      startTime: startTime.value,
      endTime: endTime.value,
    })
  }
})
</script>

<template>
  <div class="row items-end q-col-gutter-md">
    <div class="col-12 col-sm-4">
      <WSelect
        v-model="criteriaId"
        :options="options"
        optionLabel="text"
        optionValue="value"
        label="Criteria"
        placeholder="Criteria"
        emitValue
        mapOptions
      />
    </div>
    <div class="col-12 col-sm-4">
      <WDateTimeInput
        v-model="startDate"
        label="Start Date"
        placeholder="Start Date"
        mode="date"
        :disable="disable"
        :mask="props.mask"
        :format="props.format"
      />
    </div>
    <div class="col-12 col-sm-4">
      <WDateTimeInput
        v-model="endDate"
        label="End Date"
        placeholder="End Date"
        mode="date"
        :disable="disable"
        :mask="props.mask"
        :format="props.format"
      />
    </div>
  </div>
</template>

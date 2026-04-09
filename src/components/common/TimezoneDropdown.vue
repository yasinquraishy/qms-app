<script setup>
defineProps({
  label: {
    type: String,
    default: 'Timezone',
  },
  hint: {
    type: String,
    default: '',
  },
})

const model = defineModel({ type: String, default: 'UTC' })

const changeNameOfTimezone = {
  'Asia/Calcutta': 'Asia/Kolkata',
}

const timezones = computed(() => {
  const tzones = Intl.supportedValuesOf('timeZone')
  return tzones.map((zone) => {
    const offset = new Date()
      .toLocaleTimeString('en-US', {
        timeZone: zone,
        timeZoneName: 'short',
      })
      .split(' ')
      .at(-1)
    const text = changeNameOfTimezone[zone] || zone
    return { value: zone, label: `${text.replaceAll('_', ' ')} (${offset})` }
  })
})
</script>

<template>
  <div class="tw:flex tw:flex-col tw:gap-1">
    <label v-if="label" class="tw:text-xs tw:font-medium tw:text-secondary">{{ label }}</label>
    <select
      v-model="model"
      class="tw:w-full tw:rounded-lg tw:border tw:border-divider tw:bg-sidebar tw:px-3 tw:py-2 tw:text-sm tw:text-on-sidebar tw:focus:border-primary tw:focus:outline-none tw:focus:ring-2 tw:focus:ring-primary/30 tw:cursor-pointer"
    >
      <option value="">Select Timezone</option>
      <option v-for="tz in timezones" :key="tz.value" :value="tz.value">
        {{ tz.label }}
      </option>
    </select>
    <span v-if="hint" class="tw:text-xs tw:text-secondary">{{ hint }}</span>
  </div>
</template>

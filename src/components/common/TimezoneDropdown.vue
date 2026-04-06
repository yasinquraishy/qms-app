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
  rules: {
    type: Array,
    default: () => [],
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
    return { label: `${text.replaceAll('_', ' ')} (${offset})`, value: zone }
  })
})

const options = ref(timezones.value)

function filterFn(val, update) {
  if (val === '') {
    update(() => {
      options.value = timezones.value
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    options.value = timezones.value.filter((v) => v.label.toLowerCase().indexOf(needle) > -1)
  })
}
</script>

<template>
  <WSelect
    v-model="model"
    :label="label"
    :options="options"
    :hint="hint"
    :rules="rules"
    optionLabel="label"
    optionValue="value"
    useInput
    fillInput
    hideSelected
    inputDebounce="0"
    emitValue
    mapOptions
    @filter="filterFn"
  >
    <template #no-option>
      <QItem>
        <QItemSection class="text-grey"> No results </QItemSection>
      </QItem>
    </template>
  </WSelect>
</template>

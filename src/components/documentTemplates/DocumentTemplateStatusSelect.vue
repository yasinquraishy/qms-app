<script setup>
import { get } from '@/api'

const props = defineProps({
  required: {
    type: Boolean,
    default: false,
  },
  multiple: {
    type: Boolean,
    default: false,
  },
})

const statusId = defineModel('statusId', {
  type: [String, null, Array],
})

const statuses = ref([])
const loading = ref(false)

const isMultiple = computed(() => {
  return props.multiple && statusId.value !== null
})

const isClearable = computed(() => {
  return !props.required && statusId.value !== null
})

async function fetchStatuses() {
  const data = await get('/v1/services/documentTemplateStatuses', { loader: loading })

  const mappedData = data.documentTemplateStatuses.map((status) => ({
    label: status.name,
    value: status.id,
  }))

  if (props.required) {
    statuses.value = mappedData
    if (!statusId.value && mappedData.length > 0) {
      statusId.value = props.multiple ? [mappedData[0].value] : mappedData[0].value
    }
  } else {
    statuses.value = [{ label: 'All Statuses', value: null }, ...mappedData]
  }
}

onMounted(() => {
  fetchStatuses()
})
</script>

<template>
  <WSelect
    v-model="statusId"
    :options="statuses"
    :loading="loading"
    outlined
    dense
    emitValue
    mapOptions
    optionLabel="label"
    optionValue="value"
    :multiple="isMultiple"
    :clearable="isClearable"
    v-bind="$attrs"
  >
    <template v-if="$slots.label" #label>
      <slot name="label" />
    </template>
  </WSelect>
</template>

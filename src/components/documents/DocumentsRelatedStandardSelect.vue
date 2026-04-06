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
  nullLabel: {
    type: String,
    default: 'All Standards',
  },
})

const relatedStandardId = defineModel('relatedStandardId', {
  type: [String, null, Array],
})

const relatedStandards = ref([])
const loading = ref(false)

const isMultiple = computed(() => {
  return props.multiple && relatedStandardId.value !== null
})

const isClearable = computed(() => {
  return !props.required && relatedStandardId.value !== null
})

async function fetchRelatedStandards() {
  const data = await get('/v1/services/relatedStandards', { loader: loading })

  const mappedData = (data.relatedStandards || []).map((s) => ({
    label: s.name,
    value: s.id,
  }))

  if (props.required) {
    relatedStandards.value = mappedData
    if (!relatedStandardId.value && mappedData.length > 0) {
      relatedStandardId.value = props.multiple ? [mappedData[0].value] : mappedData[0].value
    }
  } else {
    relatedStandards.value = [{ label: props.nullLabel, value: null }, ...mappedData]
  }
}

onMounted(() => {
  fetchRelatedStandards()
})
</script>

<template>
  <WSelect
    v-model="relatedStandardId"
    :options="relatedStandards"
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

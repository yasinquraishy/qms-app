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

const documentTypeId = defineModel('documentTypeId', {
  type: [String, null, Array],
})

const documentTypes = ref([])
const loading = ref(false)

const isMultiple = computed(() => {
  return props.multiple && documentTypeId.value !== null
})

const isClearable = computed(() => {
  return !props.required && documentTypeId.value !== null
})

async function fetchDocumentTypes() {
  try {
    const data = await get('/v1/services/documentTypes', { loader: loading })

    const mappedData = data.documentTypes.map((dt) => ({
      label: dt.name,
      value: dt.id,
    }))

    if (props.required) {
      documentTypes.value = mappedData
      if (!documentTypeId.value && mappedData.length > 0) {
        documentTypeId.value = props.multiple ? [mappedData[0].value] : mappedData[0].value
      }
    } else {
      documentTypes.value = [{ label: 'All Document Types', value: null }, ...mappedData]
    }
  } catch {
    if (props.required) {
      documentTypes.value = []
    } else {
      documentTypes.value = [{ label: 'All Document Types', value: null }]
    }
  }
}

onMounted(() => {
  fetchDocumentTypes()
})
</script>

<template>
  <WSelect
    v-model="documentTypeId"
    :options="documentTypes"
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

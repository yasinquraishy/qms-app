<script setup>
import { currentCompany } from '@/utils/currentCompany.js'
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
    default: 'All Document Templates',
  },
})

const documentTemplateId = defineModel('documentTemplateId', {
  type: [String, null, Array],
})

const documentTemplate = defineModel('documentTemplate', {
  type: [Object, null],
  default: null,
})

const documentTemplates = ref([])
const loading = ref(false)

const isMultiple = computed(() => {
  return props.multiple && documentTemplateId.value !== null
})

const isClearable = computed(() => {
  return !props.required && documentTemplateId.value !== null
})

function resolveSelectedTemplate() {
  if (!documentTemplateId.value) {
    documentTemplate.value = null
    return
  }
  const found = documentTemplates.value.find((t) => t.id === documentTemplateId.value)
  documentTemplate.value = found || null
}

async function fetchDocumentTemplates() {
  const companyId = currentCompany.value?.id
  if (!companyId) throw new Error('No company selected')

  const data = await get('/v1/services/documentTemplates', {
    params: { companyId, statusId: 'ACTIVE' },
    loader: loading,
  })

  if (props.required) {
    documentTemplates.value = data.documentTemplates
    if (!documentTemplateId.value && data.documentTemplates.length > 0) {
      documentTemplateId.value = props.multiple
        ? [data.documentTemplates[0].id]
        : data.documentTemplates[0].id
    }
  } else {
    documentTemplates.value = [{ name: props.nullLabel, id: null }, ...data.documentTemplates]
  }

  resolveSelectedTemplate()
}

watch(documentTemplateId, () => {
  resolveSelectedTemplate()
})

onMounted(() => {
  fetchDocumentTemplates()
})
</script>

<template>
  <WSelect
    v-model="documentTemplateId"
    :options="documentTemplates"
    :loading="loading"
    outlined
    dense
    emitValue
    mapOptions
    optionLabel="name"
    optionValue="id"
    :multiple="isMultiple"
    :clearable="isClearable"
    v-bind="$attrs"
  >
    <template v-if="$slots.label" #label>
      <slot name="label" />
    </template>
  </WSelect>
</template>

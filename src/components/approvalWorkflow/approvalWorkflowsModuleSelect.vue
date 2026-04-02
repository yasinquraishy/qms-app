<script setup>
import { get } from '@/api'

const props = defineProps({
  required: {
    type: Boolean,
    default: false,
  },
})

const moduleId = defineModel('moduleId', {
  type: [String, null],
})

const modules = ref([])
const loading = ref(false)

const isClearable = computed(() => {
  return !props.required && moduleId.value !== null
})

async function fetchModules() {
  const data = await get('/v1/services/modules', {
    loader: loading,
  })

  const mappedData = (data.modules || []).map((m) => ({
    label: m.name,
    value: m.id,
  }))

  if (props.required) {
    modules.value = mappedData
    if (!moduleId.value && mappedData.length > 0) {
      moduleId.value = mappedData[0].value
    }
  } else {
    modules.value = [{ label: 'All Modules', value: null }, ...mappedData]
  }
}

onMounted(() => {
  fetchModules()
})
</script>

<template>
  <WSelect
    v-model="moduleId"
    :options="modules"
    :loading="loading"
    outlined
    dense
    emitValue
    mapOptions
    optionLabel="label"
    optionValue="value"
    :clearable="isClearable"
    v-bind="$attrs"
  >
    <template v-if="$slots.label" #label>
      <slot name="label" />
    </template>
  </WSelect>
</template>

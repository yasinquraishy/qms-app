<script setup>
import { useDepartments } from '@/composables/useDepartments.js'

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

const departmentId = defineModel('departmentId', {
  type: [String, null, Array],
})

const {
  departments: rawDepartments,
  loading,
  fetchDepartments: fetchDepartmentsApi,
} = useDepartments()

const departments = computed(() => {
  const mappedData = rawDepartments.value.map((d) => ({
    label: d.name,
    value: d.id,
  }))

  if (props.required) {
    return mappedData
  } else {
    return [{ label: 'All Departments', value: null }, ...mappedData]
  }
})

const isMultiple = computed(() => {
  return props.multiple && departmentId.value !== null
})

const isClearable = computed(() => {
  return !props.required && departmentId.value !== null
})

// Auto-select first option when required and no value is set
watch(
  () => [rawDepartments.value, props.required, props.multiple],
  () => {
    if (props.required && !departmentId.value && departments.value.length > 0) {
      departmentId.value = props.multiple
        ? [departments.value[0].value]
        : departments.value[0].value
    }
  },
  { immediate: true },
)

onMounted(() => {
  fetchDepartmentsApi()
})
</script>

<template>
  <WSelect
    v-model="departmentId"
    :options="departments"
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

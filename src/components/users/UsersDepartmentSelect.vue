<script setup>
import { useDepartments } from '@/composables/useDepartments.js'

const props = defineProps({
  required: {
    type: Boolean,
    default: true,
  },
  siteId: {
    type: [String, null],
    default: null,
  },
})

const departmentId = defineModel('departmentId', {
  type: [String, null],
})

const {
  departments: rawDepartments,
  loading,
  fetchDepartments: fetchDepartmentsApi,
} = useDepartments()

const departments = computed(() => {
  let filteredDepartments = rawDepartments.value

  // Filter by siteId if provided
  if (props.siteId) {
    filteredDepartments = filteredDepartments.filter((d) => d.siteId === props.siteId)
  }

  const mappedData = filteredDepartments.map((d) => ({
    label: `${d.name} (${d.code})`,
    value: d.id,
  }))

  if (props.required) {
    return mappedData
  } else {
    return [{ label: 'All Departments', value: null }, ...mappedData]
  }
})

const isClearable = computed(() => {
  return !props.required && departmentId.value !== null
})

// Auto-select first option when required and no value is set
watch(
  () => [departments.value, props.required, props.siteId],
  () => {
    if (props.required && departments.value.length > 0) {
      // If siteId changed or department is not in the filtered list, select first
      const isDepartmentInList = departments.value.some((d) => d.value === departmentId.value)
      if (!departmentId.value || !isDepartmentInList) {
        departmentId.value = departments.value[0].value
      }
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
    :clearable="isClearable"
    :disable="!siteId && required"
    v-bind="$attrs"
  >
    <template v-if="$slots.label" #label>
      <slot name="label" />
    </template>
  </WSelect>
</template>

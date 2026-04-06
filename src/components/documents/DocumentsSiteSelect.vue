<script setup>
import { useSites } from '@/composables/useSites.js'

const props = defineProps({
  required: {
    type: Boolean,
    default: true,
  },
  multiple: {
    type: Boolean,
    default: false,
  },
})

const siteId = defineModel('siteId', {
  type: [String, null, Array],
  default: null,
})

const isMultiple = computed(() => {
  return props.multiple && siteId.value !== null
})

const isClearable = computed(() => {
  return !props.required && siteId.value !== null
})

const { sites: rawSites, loading, fetchSites: fetchSitesApi } = useSites()

// Initialize sites
fetchSitesApi()

const sites = computed(() => {
  const mappedData = rawSites.value.map((site) => ({
    label: `${site.name} (${site.code})`,
    value: site.id,
  }))

  if (props.required) {
    return mappedData
  } else {
    return [{ label: 'All Sites', value: null }, ...mappedData]
  }
})

// Set default value if required
watch(
  sites,
  (newSites) => {
    if (props.required && !siteId.value && newSites.length > 0) {
      siteId.value = props.multiple ? [newSites[0].value] : newSites[0].value
    }
  },
  { immediate: true },
)
</script>

<template>
  <WSelect
    v-model="siteId"
    :options="sites"
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

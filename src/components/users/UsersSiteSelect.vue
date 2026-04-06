<script setup>
import { useSites } from '@/composables/useSites.js'

const props = defineProps({
  required: {
    type: Boolean,
    default: true,
  },
})

const siteId = defineModel('siteId', {
  type: [String, null],
  default: null,
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

const isClearable = computed(() => {
  return !props.required && siteId.value !== null
})

// Set default value if required
watch(
  sites,
  (newSites) => {
    if (props.required && !siteId.value && newSites.length > 0) {
      siteId.value = newSites[0].value
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
    :clearable="isClearable"
    v-bind="$attrs"
  >
    <template v-if="$slots.label" #label>
      <slot name="label" />
    </template>
  </WSelect>
</template>

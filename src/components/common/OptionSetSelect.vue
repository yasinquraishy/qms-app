<script setup>
import { useOptionSets } from '@/composables/useOptionSets.js'

const props = defineProps({
  options: {
    type: Array,
    default: () => [],
  },
  optionSetId: {
    type: String,
    default: null,
  },
})

// Use WSelect props
const attrs = useAttrs()

const { fetchOptionSet } = useOptionSets()
const fetchedOptions = ref([])

const computedOptions = computed(() => {
  if (props.optionSetId && fetchedOptions.value.length > 0) {
    return fetchedOptions.value
  }
  return props.options || []
})

async function loadOptionSetIfNeeded() {
  if (props.optionSetId) {
    const data = await fetchOptionSet(props.optionSetId)
    if (data && Array.isArray(data.options)) {
      fetchedOptions.value = data.options
    }
  }
}

onMounted(() => {
  loadOptionSetIfNeeded()
})

watch(
  () => props.optionSetId,
  (newId) => {
    if (newId) {
      loadOptionSetIfNeeded()
    } else {
      fetchedOptions.value = []
    }
  },
)
</script>

<template>
  <WSelect v-bind="attrs" :options="computedOptions" />
</template>

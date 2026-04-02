<script setup>
import { computed, onMounted, ref, watch, useAttrs } from 'vue'
import { useOptionSets } from '@/composables/useOptionSets.js'
import WOptionGroup from '@shared/components/optionGroup/WOptionGroup.js'

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

// Use WOptionGroup props
const attrs = useAttrs()

const { fetchOptionSet } = useOptionSets()
const fetchedOptions = ref([])

const computedOptions = computed(() => {
  if (props.optionSetId && fetchedOptions.value.length > 0) {
    return fetchedOptions.value.map((opt) => {
      // If option is a string, format it for WOptionGroup (which usually expects objects or handles strings internally but let's be safe if WOptionGroup logic varies)
      // WOptionGroup implementation handles strings in `options` prop by mapping them to { label, value } locally.
      // But let's check what fetchOptionSet returns. It returns { options: [...] } where options can be strings or objects.
      if (typeof opt === 'string') {
        return { label: opt, value: opt }
      }
      return opt
    })
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
  <WOptionGroup v-bind="attrs" :options="computedOptions" />
</template>

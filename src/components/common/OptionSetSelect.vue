<script setup>
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

// Use WSelect attrs
const attrs = useAttrs()

const optionSet = useLiveQueryWithDeps(
  [() => props.optionSetId],
  async (db, [optionSetId]) => {
    if (!optionSetId) return null
    return db.OptionSet.findByPk(optionSetId)
  },
  { initial: null },
)

const computedOptions = computed(() => {
  if (optionSet.value?.options) return optionSet.value.options
  return props.options || []
})
</script>

<template>
  <WSelect v-bind="attrs" :options="computedOptions" />
</template>

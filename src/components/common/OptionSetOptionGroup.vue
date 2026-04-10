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

// Use WOptionGroup props
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
  if (optionSet.value?.options) {
    return optionSet.value.options.map((opt) => {
      if (typeof opt === 'string') return { label: opt, value: opt }
      return opt
    })
  }
  return props.options || []
})
</script>

<template>
  <WOptionGroup v-bind="attrs" :options="computedOptions" />
</template>

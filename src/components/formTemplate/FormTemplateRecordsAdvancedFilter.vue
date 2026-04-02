<script setup>
const props = defineProps({
  columns: {
    type: Array,
    required: true,
  },
})

const modelValue = defineModel({
  type: Array,
  default: () => [],
})

// Filter sections - initialize from modelValue if provided
const filterSections = ref(
  modelValue.value.length > 0
    ? modelValue.value.map((filter) => ({ ...filter, id: Date.now() + Math.random() }))
    : [
        {
          id: Date.now(),
          column: null,
          operator: 'includes',
          value: '',
        },
      ],
)

// Operator options
const operatorOptions = [
  { label: 'Includes', value: 'includes' },
  { label: 'Equals', value: 'equals' },
  { label: 'Not Equals', value: 'not-equals' },
]

// Column options (exclude required columns that aren't filterable)
const columnOptions = computed(() => {
  return props.columns
    .filter((col) => !col.required || col.name === 'statusId')
    .map((col) => ({
      label: col.label,
      value: col.name,
    }))
})

function addFilterSection() {
  filterSections.value.push({
    id: Date.now(),
    column: null,
    operator: 'includes',
    value: '',
  })
}

function removeFilterSection(index) {
  if (filterSections.value.length > 1) {
    filterSections.value.splice(index, 1)
  }
}

function applyFilters() {
  const validFilters = filterSections.value.filter(
    (section) => section.column && section.value.trim() !== '',
  )
  modelValue.value = validFilters
}

function resetFilters() {
  filterSections.value = [
    {
      id: Date.now(),
      column: null,
      operator: 'includes',
      value: '',
    },
  ]
  modelValue.value = []
}
</script>

<template>
  <div class="tw:p-4 tw:min-w-160">
    <div class="tw:text-base tw:font-semibold tw:mb-4">Advanced Filters</div>

    <div class="tw:flex tw:flex-col tw:gap-3 tw:mb-4">
      <div
        v-for="(section, index) in filterSections"
        :key="section.id"
        class="tw:flex tw:items-start tw:gap-2"
      >
        <div class="tw:grid tw:grid-cols-3 tw:gap-2 tw:flex-1">
          <WSelect
            v-model="section.column"
            :options="columnOptions"
            label="Column"
            optionLabel="label"
            optionValue="value"
            dense
            emitValue
            mapOptions
          />
          <WSelect
            v-model="section.operator"
            :options="operatorOptions"
            label="Operator"
            optionLabel="label"
            optionValue="value"
            dense
            emitValue
            mapOptions
          />
          <WInput v-model="section.value" label="Value" dense />
        </div>
        <WBtn
          v-if="filterSections.length > 1"
          flat
          round
          dense
          icon="close"
          color="negative"
          class="tw:mt-1"
          @click="removeFilterSection(index)"
        >
          <QTooltip>Remove filter</QTooltip>
        </WBtn>
      </div>
    </div>

    <div class="tw:flex tw:items-center tw:gap-2 tw:mb-4">
      <WBtn
        flat
        icon="add"
        label="Add Filter"
        color="primary"
        size="sm"
        @click="addFilterSection"
      />
    </div>

    <div class="tw:flex tw:justify-end tw:gap-2 tw:border-t tw:pt-3 tw:border-divider">
      <WBtn v-close-popup flat label="Reset" color="grey" @click="resetFilters" />
      <WBtn v-close-popup label="Apply Filters" color="primary" @click="applyFilters" />
    </div>
  </div>
</template>

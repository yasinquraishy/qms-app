<script setup>
import { computed } from 'vue'
import { COLUMN_INPUT_TYPES } from '@/constants/formBuilderConfig'

const field = defineModel('field', {
  type: Object,
  required: true,
})

function addRow() {
  if (!field.value.rows) {
    field.value.rows = []
  }
  field.value.rows.push('')
}

function removeRow(index) {
  field.value.rows.splice(index, 1)
}

function addColumn() {
  if (!field.value.columns) {
    field.value.columns = []
  }
  const newIndex = field.value.columns.length
  field.value.columns.push({ label: '', value: '', inputType: 'radio' })
  updateColumnValue(newIndex)
}

function toCamelCase(str) {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase()
    })
    .replace(/\s+/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
}

function updateColumnValue(index) {
  const col = field.value.columns[index]
  if (!col) return

  if (!col.label) {
    col.value = ''
    return
  }

  const baseValue = toCamelCase(col.label) || 'col'
  let uniqueValue = baseValue
  let counter = 1

  // Check uniqueness against other columns in the same checklist
  const otherValues = field.value.columns.filter((_, i) => i !== index).map((c) => c.value)

  while (otherValues.includes(uniqueValue)) {
    uniqueValue = `${baseValue}_${counter}`
    counter++
  }

  col.value = uniqueValue
}

function removeColumn(index) {
  field.value.columns.splice(index, 1)
}

// Get all columns with select/dropdown inputType (with their original index)
const selectColumns = computed(() => {
  if (!field.value.columns) return []
  return field.value.columns
    .map((col, index) => ({ ...col, _originalIndex: index }))
    .filter((col) => col.inputType === 'select' || col.inputType === 'dropdown')
})

function addColumnOption(selectColumnIndex) {
  const col = selectColumns.value[selectColumnIndex]
  if (!col) return
  const originalIndex = col._originalIndex

  const targetCol = field.value.columns[originalIndex]

  if (!targetCol.options) {
    targetCol.options = []
  }
  targetCol.options.push('')
}

function removeColumnOption(selectColumnIndex, optionIndex) {
  const col = selectColumns.value[selectColumnIndex]
  if (!col) return
  const originalIndex = col._originalIndex

  field.value.columns[originalIndex].options.splice(optionIndex, 1)
}
</script>

<template>
  <div class="tw:flex tw:flex-col tw:gap-4">
    <div class="tw:flex tw:flex-col tw:gap-3">
      <div class="ds-label-sm tw:text-secondary">Rows</div>
      <div
        v-for="(row, index) in field.rows"
        :key="'row-' + index"
        class="tw:bg-main-hover tw:p-3 tw:rounded-lg"
      >
        <div class="tw:flex tw:gap-2 tw:items-center">
          <div class="tw:flex-1">
            <WInput v-model="field.rows[index]" placeholder="Row Label" dense />
          </div>
          <WBtn
            flat
            round
            dense
            size="sm"
            icon="sym_o_delete"
            color="negative"
            @click="removeRow(index)"
          />
        </div>
      </div>
      <WBtn
        flat
        dense
        icon="sym_o_add"
        label="Add Row"
        color="primary"
        class="tw:self-start"
        @click="addRow"
      />
    </div>

    <div class="tw:flex tw:flex-col tw:gap-3">
      <div class="ds-label-sm tw:text-secondary">Columns</div>
      <div
        v-for="(col, index) in field.columns"
        :key="'col-' + index"
        class="tw:bg-main-hover tw:p-3 tw:rounded-lg"
      >
        <div class="tw:flex tw:flex-col tw:gap-3">
          <div class="tw:flex tw:gap-2 tw:items-center">
            <div class="tw:flex-1">
              <WInput
                v-model="col.label"
                placeholder="Header Label"
                dense
                @update:modelValue="updateColumnValue(index)"
              />
            </div>
            <WBtn
              flat
              round
              dense
              size="sm"
              icon="sym_o_delete"
              color="negative"
              @click="removeColumn(index)"
            />
          </div>
          <WSelect
            v-model="col.inputType"
            :options="COLUMN_INPUT_TYPES"
            label="Input Type"
            dense
            emitValue
            mapOptions
            optionLabel="label"
            optionValue="value"
          />
        </div>
      </div>
      <WBtn
        flat
        dense
        icon="sym_o_add"
        label="Add Column"
        color="primary"
        class="tw:self-start"
        @click="addColumn"
      />
    </div>

    <!-- Options for each Select/Dropdown column -->
    <template v-for="(col, colIndex) in selectColumns" :key="'col-options-' + colIndex">
      <div class="tw:flex tw:flex-col tw:gap-3">
        <div class="ds-label-sm tw:text-secondary">
          Options for "{{ col.label || col.value || 'Column ' + (colIndex + 1) }}"
        </div>
        <div
          v-for="(option, optIndex) in col.options || []"
          :key="'col-' + colIndex + '-option-' + optIndex"
          class="tw:bg-main-hover tw:p-3 tw:rounded-lg"
        >
          <div class="tw:flex tw:gap-2 tw:items-center">
            <div class="tw:flex-1">
              <WInput v-model="col.options[optIndex]" placeholder="Option" dense />
            </div>
            <WBtn
              flat
              round
              dense
              size="sm"
              icon="sym_o_delete"
              color="negative"
              @click="removeColumnOption(colIndex, optIndex)"
            />
          </div>
        </div>
        <WBtn
          flat
          dense
          icon="sym_o_add"
          label="Add Option"
          color="primary"
          class="tw:self-start"
          @click="addColumnOption(colIndex)"
        />
      </div>
    </template>

    <div class="tw:pt-2">
      <QCheckbox v-model="field.dense" label="Dense mode" dense />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>

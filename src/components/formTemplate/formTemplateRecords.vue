<script setup>
import { exportToCSV, exportToExcel } from '@/utils/exportUtils.js'
import { exportRecordPDFs } from '@/utils/exportRecordPDFs.js'
import { exportRecordPDFsHTML } from '@/utils/exportRecordPDFsHTML.js'
import { getProp, setProp } from '@shared/composables/object.js'
import DynamicForm from '@/components/form/DynamicForm.js'
import FormTemplateRecordsAdvancedFilter from './FormTemplateRecordsAdvancedFilter.vue'
import { useQuasar } from 'quasar'
import { isAllowed } from '@/utils/currentSession'

const props = defineProps({
  templateId: {
    type: String,
    required: true,
  },
  templateName: {
    type: String,
    required: true,
  },
  schema: {
    type: Array,
    default: () => [],
  },
})

// Composables
const { templateRecords, recordsLoading, fetchTemplateRecords, updateRecord } = useFormTemplates()
const $q = useQuasar()

// ---- Refs ----
// Search
const searchQuery = ref('')

// Column visibility
const visibleColumns = ref([])

// Editable columns tracking
const editableColumns = ref(new Set())

// Advanced filters
const advancedFilters = ref([])

// Inline cell editing
const editModel = ref({})
const editingRecord = ref(null)
const editingField = ref(null)
const editSaving = ref(false)

// ---- Helpers ----
function getRawValue(obj, path) {
  if (!obj) return undefined
  const parts = path.split('.')
  let value = obj
  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = value[part]
    } else {
      return undefined
    }
  }
  return value
}

function getMaxRepeaterItems(path) {
  let max = 0
  for (const record of templateRecords.value || []) {
    const value = getRawValue(record.payload, path)
    if (Array.isArray(value)) {
      max = Math.max(max, value.length)
    }
  }
  return max
}

// Extract leaf field metadata from a repeater template (for cell preview)
// Recursively flattens all leaf fields, handling nested sections/rows/columns
function extractTemplateLeafFields(templateItems) {
  const leaves = []
  function walk(items, path = []) {
    items.forEach((item) => {
      if (item.type === 'separator') return

      // Handle nested containers
      if (['section', 'row', 'column'].includes(item.type)) {
        const newPath = item.name ? [...path, item.name] : path
        if (item.children) walk(item.children, newPath)
        return
      }

      // Skip nested repeaters (too complex for preview)
      if (item.type === 'repeater') return

      // Leaf field
      if (item.name) {
        const fullPath = [...path, item.name].join('.')
        leaves.push({
          name: item.name,
          path: fullPath,
          label: item.label || item.name,
        })
      }
    })
  }
  walk(templateItems)
  return leaves
}

// ---- Computed ----
// Web columns: flat labels, repeaters collapsed into single column
const schemaFields = computed(() => {
  const fields = []

  function extractFields(schemaItems, dataPath) {
    schemaItems.forEach((item) => {
      if (item.type === 'separator') return

      const newDataPath = item.name ? (dataPath ? `${dataPath}.${item.name}` : item.name) : dataPath

      // Container types: traverse children (labels NOT accumulated for web)
      if (['section', 'row', 'column'].includes(item.type)) {
        if (item.children) {
          extractFields(item.children, newDataPath)
        }
        return
      }

      // Repeater: single collapsed column
      if (item.type === 'repeater' && item.name) {
        fields.push({
          name: newDataPath,
          label: item.label || item.name,
          type: 'repeater',
          schemaItem: { ...item },
          templateFields: extractTemplateLeafFields(item.template || []),
        })
        return
      }

      // Leaf data fields — flat label (just the field's own label)
      if (item.name) {
        fields.push({
          name: newDataPath,
          label: item.label || item.name,
          type: item.type,
          schemaItem: { ...item },
        })
      }
    })
  }

  if (props.schema) {
    extractFields(props.schema, '')
  }

  return fields
})

// Export columns: full hierarchical labels, repeaters expanded per item
const exportSchemaFields = computed(() => {
  const fields = []

  function extractFields(schemaItems, dataPath, labelParts) {
    schemaItems.forEach((item) => {
      if (item.type === 'separator') return

      const newDataPath = item.name ? (dataPath ? `${dataPath}.${item.name}` : item.name) : dataPath

      if (['section', 'row', 'column'].includes(item.type)) {
        const newLabelParts = item.label ? [...labelParts, item.label] : labelParts
        if (item.children) {
          extractFields(item.children, newDataPath, newLabelParts)
        }
        return
      }

      if (item.type === 'repeater' && item.name) {
        const repeaterLabel = item.label || item.name
        const maxItems = Math.max(getMaxRepeaterItems(newDataPath), item.minItems || 0)
        if (item.template && maxItems > 0) {
          for (let i = 0; i < maxItems; i++) {
            const itemDataPath = `${newDataPath}.${i}`
            const itemLabelParts = [...labelParts, `${repeaterLabel} (${i + 1})`]
            extractFields(item.template, itemDataPath, itemLabelParts)
          }
        }
        return
      }

      if (item.name) {
        fields.push({
          name: newDataPath,
          label: [...labelParts, item.label || item.name].join(' > '),
          type: item.type,
          schemaItem: { ...item },
        })
      }
    })
  }

  if (props.schema) {
    extractFields(props.schema, '', [])
  }

  return fields
})

// Generate table columns
const columns = computed(() => {
  const standardColumns = [
    {
      name: 'recordNumber',
      label: 'RECORD #',
      field: 'recordNumber',
      align: 'left',
      sortable: true,
      required: true,
      editable: false,
    },
    {
      name: 'statusId',
      label: 'STATUS',
      field: 'statusId',
      align: 'left',
      sortable: true,
      editable: false,
    },
    {
      name: 'createdAt',
      label: 'SUBMISSION DATE',
      field: 'createdAt',
      align: 'left',
      sortable: true,
      editable: false,
    },
    {
      name: 'createdBy',
      label: 'CREATED BY',
      field: (row) =>
        row.user ? `${row.user.firstName} ${row.user.lastName} \n ${row.user.email}` : '-',
      align: 'left',
      sortable: true,
      editable: false,
    },
    {
      name: 'submissionIp',
      label: 'SUBMISSION IP',
      field: 'submissionIp',
      align: 'left',
      sortable: true,
      editable: false,
    },
  ]

  // Add dynamic schema columns (web: flat labels, repeaters as single columns)
  const schemaColumns = schemaFields.value.map((field) => ({
    name: field.name,
    label: field.label.toUpperCase(),
    field: (row) =>
      field.type === 'repeater'
        ? getRawValue(row.payload, field.name) || []
        : getFieldValue(row.payload, field.name),
    align: 'left',
    sortable: true,
    fieldType: field.type,
    editable: true,
  }))

  return [...standardColumns, ...schemaColumns]
})

// Export columns: full hierarchical labels, repeaters expanded
const exportColumns = computed(() => {
  const standardColumns = [
    {
      name: 'recordNumber',
      label: 'RECORD #',
      field: 'recordNumber',
      align: 'left',
      sortable: true,
    },
    {
      name: 'statusId',
      label: 'STATUS',
      field: 'statusId',
      align: 'left',
      sortable: true,
    },
    {
      name: 'createdAt',
      label: 'SUBMISSION DATE',
      field: 'createdAt',
      align: 'left',
      sortable: true,
    },
    {
      name: 'createdBy',
      label: 'CREATED BY',
      field: (row) =>
        row.user ? `${row.user.firstName} ${row.user.lastName} ${row.user.email}` : '-',
      align: 'left',
      sortable: true,
    },
    {
      name: 'submissionIp',
      label: 'SUBMISSION IP',
      field: 'submissionIp',
      align: 'left',
      sortable: true,
    },
  ]

  const schemaColumns = exportSchemaFields.value.map((field) => ({
    name: field.name,
    label: field.label.toUpperCase(),
    field: (row) => getFieldValue(row.payload, field.name),
    align: 'left',
    sortable: true,
  }))

  return [...standardColumns, ...schemaColumns]
})

// Selectable columns (excluding required ones)
const selectableColumns = computed(() => {
  return columns.value.filter((col) => !col.required)
})

// All columns visibility state
const allColumnsVisible = computed(() => {
  return visibleColumns.value.length === columns.value.length
})

// Filter records based on search query and advanced filters
const filteredRecords = computed(() => {
  let records = templateRecords.value

  // Apply advanced filters
  if (advancedFilters.value.length > 0) {
    records = records.filter((record) => {
      return advancedFilters.value.every((filter) => {
        // Payload field
        const value = getProp(record, filter.column)

        if (value === null || value === undefined) {
          return false
        }

        const valueStr = String(value).toLowerCase()
        const filterValue = filter.value.toLowerCase()

        switch (filter.operator) {
          case 'includes':
            return valueStr.includes(filterValue)
          case 'equals':
            return valueStr === filterValue
          case 'not-equals':
            return valueStr !== filterValue
          default:
            return true
        }
      })
    })
  }

  // Apply search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    records = records.filter((record) => {
      const recordStr = JSON.stringify(record).toLowerCase()
      return recordStr.includes(query)
    })
  }

  return records
})

const canUpdate = computed(() => isAllowed(['records:update']))

// ---- Watchers ----
// Initialize visible columns and editable columns on mount
watch(
  columns,
  (newColumns) => {
    if (visibleColumns.value.length === 0) {
      visibleColumns.value = newColumns.map((col) => col.name)
    }
    // Initialize editable columns with columns that have editable: true
    if (editableColumns.value.size === 0) {
      editableColumns.value = new Set(
        newColumns.filter((col) => col.editable).map((col) => col.name),
      )
    }
  },
  { immediate: true },
)

// ---- Lifecycle Hooks ----
// Fetch records on mount
onMounted(() => {
  if (props.templateId) {
    fetchTemplateRecords(props.templateId)
  }
})

// ---- Functions ----
// Helper to get nested field value from payload
function getFieldValue(payload, fieldPath) {
  if (!payload) return '-'

  const parts = fieldPath.split('.')
  let value = payload

  for (const part of parts) {
    if (value && typeof value === 'object' && part in value) {
      value = value[part]
    } else {
      return '-'
    }
  }

  // Format value based on type
  if (value === null || value === undefined || value === '') {
    return '-'
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? `${value.length} items` : '-'
  }

  if (typeof value === 'object') {
    return JSON.stringify(value)
  }

  return String(value)
}

// Toggle all columns
function toggleAllColumns() {
  if (visibleColumns.value.length === columns.value.length) {
    // Hide all except required
    visibleColumns.value = columns.value.filter((col) => col.required).map((col) => col.name)
  } else {
    // Show all
    visibleColumns.value = columns.value.map((col) => col.name)
  }
}

// Toggle column editable state
function toggleColumnEditable(columnName, event) {
  event.stopPropagation()
  const column = columns.value.find((col) => col.name === columnName)
  if (!column || !column.editable) return // Only toggle if column supports editing

  if (editableColumns.value.has(columnName)) {
    editableColumns.value.delete(columnName)
  } else {
    editableColumns.value.add(columnName)
  }
  // Trigger reactivity
  editableColumns.value = new Set(editableColumns.value)
}

// Check if column is editable
function isColumnEditable(columnName) {
  return editableColumns.value.has(columnName)
}

// Get edit field schema
function getEditFieldSchema(field) {
  if (!field) return []
  if (field.type === 'repeater') {
    return [{ ...field.schemaItem, name: 'value' }]
  }
  const item = { ...field.schemaItem, name: 'value', label: field.schemaItem.label }
  return [item]
}

// Handle menu show for inline editing
function onMenuShow(scope) {
  const field = schemaFields.value.find((f) => f.name === scope.col.name)
  if (!field) return

  editingRecord.value = scope.row
  editingField.value = field
  const currentValue = getProp(scope.row.payload, field.name)
  if (field.type === 'repeater') {
    editModel.value = { value: JSON.parse(JSON.stringify(currentValue || [])) }
  } else {
    editModel.value = { value: currentValue ?? null }
  }
}

// Get repeater cell preview text
function getRepeaterPreview(items, templateFields) {
  if (!Array.isArray(items) || items.length === 0) return { text: '-', moreCount: 0 }

  const firstItem = items[0]
  const maxFieldsToShow = 3 // Show only first 3 fields to avoid clutter

  // Collect all non-empty field values
  const allParts = templateFields
    .map((f) => {
      // Handle nested paths (e.g., 'row1.actionTaken')
      const val = f.path ? getRawValue(firstItem, f.path) : firstItem?.[f.name]
      if (val === null || val === undefined || val === '') return null

      // Handle complex values
      let displayVal = val
      if (Array.isArray(val)) {
        displayVal = `[${val.length} items]`
      } else if (typeof val === 'object') {
        displayVal = '[Object]'
      } else if (String(val).length > 50) {
        displayVal = String(val).substring(0, 47) + '...'
      }

      return { label: f.label, value: displayVal }
    })
    .filter(Boolean)

  // Show only first N fields
  const visibleParts = allParts.slice(0, maxFieldsToShow)
  const hasMoreFields = allParts.length > maxFieldsToShow

  const text = visibleParts.map((p) => `${p.label}: ${p.value}`).join(', ')

  const suffix = hasMoreFields
    ? ` (+${allParts.length - maxFieldsToShow} more field${allParts.length - maxFieldsToShow > 1 ? 's' : ''})`
    : ''

  return {
    text: text ? text + suffix : '-',
    moreCount: items.length > 1 ? items.length - 1 : 0,
  }
}

// Handle menu hide and save edited value
async function onMenuHide() {
  const record = editingRecord.value
  const field = editingField.value

  if (!record || !field) {
    return
  }

  const oldValue = getProp(record.payload, field.name)
  const newValue = editModel.value.value

  // Skip save if value didn't change
  if (JSON.stringify(oldValue) === JSON.stringify(newValue)) {
    return
  }

  editSaving.value = true
  const newPayload = JSON.parse(JSON.stringify(record.payload))
  setProp(newPayload, field.name, newValue, true)

  const success = await updateRecord(record.id, { payload: newPayload })

  if (success) {
    $q.notify({ type: 'positive', message: 'Record updated' })
  } else {
    $q.notify({ type: 'negative', message: 'Failed to update record' })
  }

  editSaving.value = false
}

// Export function
async function handleExport(format) {
  if (!templateRecords.value || templateRecords.value.length === 0) {
    $q.notify({
      type: 'warning',
      message: 'No data to export',
    })
    return
  }

  try {
    const filename = `${props.templateName}_records_${new Date().toISOString().split('T')[0]}`

    if (format === 'csv') {
      exportToCSV(templateRecords.value, exportColumns.value, filename)
    } else if (format === 'excel') {
      await exportToExcel(templateRecords.value, exportColumns.value, filename, 'Records')
    } else if (format === 'pdf') {
      await exportRecordPDFs(templateRecords.value, props.schema, props.templateName)
    } else if (format === 'pdf-html') {
      await exportRecordPDFsHTML(templateRecords.value, props.schema, props.templateName)
    }

    $q.notify({
      type: 'positive',
      message: `Exported to ${format.toUpperCase()} successfully`,
    })
  } catch (error) {
    console.error('Export failed:', error)

    let errorMessage = `Failed to export to ${format.toUpperCase()}`
    if (error.message.includes('Cannot find module')) {
      errorMessage = `${format.toUpperCase()} export requires additional libraries. Please contact administrator.`
    }

    $q.notify({
      type: 'negative',
      message: errorMessage,
    })
  }
}
</script>

<template>
  <div class="tw:flex tw:flex-col tw:h-full tw:p-6">
    <SafeTeleport to="#main-header-actions">
      <div class="tw:flex tw:gap-1">
        <WBtn
          icon="download"
          label="CSV"
          outline
          size="sm"
          color="primary"
          @click="handleExport('csv')"
        />
        <WBtn
          icon="download"
          label="Excel"
          outline
          size="sm"
          color="primary"
          @click="handleExport('excel')"
        />
        <WBtn
          icon="download"
          label="PDF"
          outline
          size="sm"
          color="primary"
          @click="handleExport('pdf')"
        />
      </div>
    </SafeTeleport>

    <!-- Toolbar with Search and Export Buttons -->
    <div
      v-if="!recordsLoading && templateRecords.length > 0"
      class="tw:flex tw:justify-between tw:items-center tw:mb-4 tw:gap-4"
    >
      <div class="tw:flex tw:items-center tw:gap-2">
        <WInput v-model="searchQuery" placeholder="Search records..." class="tw:w-64">
          <template #prepend>
            <WIcon icon="search" />
          </template>
          <template #append>
            <WIcon
              v-if="searchQuery"
              icon="close"
              class="tw:cursor-pointer"
              @click="searchQuery = ''"
            />
          </template>
        </WInput>
        <div class="tw:text-sm tw:text-gray-600">
          {{ filteredRecords.length }} / {{ templateRecords.length }} record{{
            templateRecords.length !== 1 ? 's' : ''
          }}
        </div>
      </div>
      <div class="tw:flex tw:gap-2">
        <!-- Column Visibility Dropdown -->
        <QBtn flat dense icon="view_column" color="primary">
          <QMenu>
            <QList class="tw:min-w-62.5 tw:max-w-110">
              <QItem>
                <QItemSection class="tw:font-semibold tw:text-sm"> Show/Hide Columns </QItemSection>
                <QItemSection side>
                  <WBtn
                    flat
                    dense
                    size="xs"
                    :label="allColumnsVisible ? 'Hide All' : 'Show All'"
                    @click="toggleAllColumns"
                  />
                </QItemSection>
              </QItem>
              <QSeparator />
              <QItem v-for="column in selectableColumns" :key="column.name" dense>
                <QItemSection side top>
                  <QCheckbox v-model="visibleColumns" :val="column.name" />
                </QItemSection>
                <QItemSection>
                  <QItemLabel>{{ column.label }}</QItemLabel>
                </QItemSection>
                <QItemSection side>
                  <WBtn
                    v-if="column.editable"
                    flat
                    round
                    dense
                    size="xs"
                    :icon="isColumnEditable(column.name) ? 'lock_open' : 'lock'"
                    :color="isColumnEditable(column.name) ? 'positive' : 'grey'"
                    @click="toggleColumnEditable(column.name, $event)"
                  >
                    <QTooltip>{{
                      isColumnEditable(column.name) ? 'Lock column' : 'Unlock column'
                    }}</QTooltip>
                  </WBtn>
                  <WIcon v-else name="lock" size="14px" class="tw:text-gray-400" />
                </QItemSection>
              </QItem>
            </QList>
          </QMenu>
          <QTooltip>Show/Hide Columns</QTooltip>
        </QBtn>

        <!-- Advanced Filter Button -->
        <QBtn flat dense icon="filter_alt" color="primary">
          <QMenu>
            <FormTemplateRecordsAdvancedFilter v-model="advancedFilters" :columns="columns" />
          </QMenu>
          <QTooltip>Advanced Filters</QTooltip>
          <QBadge v-if="advancedFilters.length > 0" color="primary" floating rounded>
            {{ advancedFilters.length }}
          </QBadge>
        </QBtn>
      </div>
    </div>

    <!-- Empty State -->
    <WEmptyState
      v-if="!recordsLoading && templateRecords.length === 0"
      icon="description"
      title="No Records Found"
      description="No records have been created using this template yet."
    />

    <!-- Table -->
    <WTable
      v-else
      :rows="filteredRecords"
      :columns="columns"
      :visibleColumns="visibleColumns"
      :loading="recordsLoading"
      class="tw:flex-1"
      hideTop
      noBorder
    >
      <template #header-cell="scope">
        <QTh :props="scope">
          {{ scope.col.label }}
        </QTh>
      </template>

      <!-- Status Badge -->
      <template #body-cell-statusId="scope">
        <QTd :props="scope">
          <QBadge color="grey-3" textColor="grey-9" :label="scope.row.statusId" />
        </QTd>
      </template>

      <!-- Created At Date -->
      <template #body-cell-createdAt="scope">
        <QTd :props="scope">
          {{ scope.row.createdAt.formatDate('date') }}
        </QTd>
      </template>

      <!-- Created By User -->
      <template #body-cell-createdBy="scope">
        <QTd :props="scope">
          <div v-if="scope.row.user" class="tw:flex tw:flex-col">
            <span class="tw:font-medium">
              {{ scope.row.user.firstName }} {{ scope.row.user.lastName }}
            </span>
            <span class="tw:text-xs tw:text-gray-500">{{ scope.row.user.email }}</span>
          </div>
          <span v-else class="tw:text-gray-500">-</span>
        </QTd>
      </template>

      <!-- Dynamic Schema Fields (click-to-edit) -->
      <template #body-cell="scope">
        <!-- Repeater column -->
        <template v-if="scope.col.fieldType === 'repeater'">
          <QTd :props="scope">
            <div
              v-for="(preview, idx) in [
                getRepeaterPreview(
                  scope.value,
                  schemaFields.find((f) => f.name === scope.col.name)?.templateFields || [],
                ),
              ]"
              :key="idx"
              :class="['tw:max-w-80', isColumnEditable(scope.col.name) ? 'tw:cursor-pointer' : '']"
            >
              <template v-if="preview.text !== '-'">
                <span
                  class="tw:text-sm tw:flow-root tw:text-nowrap tw:text-ellipsis tw:overflow-hidden"
                >
                  {{ preview.text }}
                </span>
                <span v-if="preview.moreCount > 0" class="tw:text-xs tw:text-gray-500 tw:ml-1">
                  +{{ preview.moreCount }} more
                </span>
              </template>
              <span v-else class="tw:text-gray-500">-</span>
            </div>
            <QMenu
              v-if="isColumnEditable(scope.col.name)"
              :offset="[0, 4]"
              anchor="bottom left"
              self="top left"
              :readonly="!canUpdate"
              @beforeShow="onMenuShow(scope)"
              @hide="onMenuHide"
            >
              <div class="tw:p-3 tw:min-w-80 tw:max-w-120">
                <DynamicForm
                  v-model="editModel"
                  :fields="getEditFieldSchema(editingField)"
                  :loading="editSaving"
                />
              </div>
            </QMenu>
          </QTd>
        </template>
        <!-- Editable leaf cell -->
        <template
          v-else-if="
            schemaFields.find((f) => f.name === scope.col.name) && isColumnEditable(scope.col.name)
          "
        >
          <QTd :props="scope">
            <div
              class="tw:cursor-pointer tw:border-gray-400 tw:max-w-60 tw:overflow-hidden tw:whitespace-nowrap tw:text-ellipsis"
            >
              <span>{{ scope.value }}</span>
            </div>
            <QMenu
              :offset="[0, 4]"
              anchor="bottom left"
              self="top left"
              @beforeShow="onMenuShow(scope)"
              @hide="onMenuHide"
            >
              <div class="tw:p-3 tw:min-w-60">
                <DynamicForm
                  v-model="editModel"
                  :fields="getEditFieldSchema(editingField)"
                  :loading="editSaving"
                  :readonly="!canUpdate"
                />
              </div>
            </QMenu>
          </QTd>
        </template>
        <!-- Non-editable cell -->
        <template v-else>
          <QTd
            :props="scope"
            class="tw:max-w-60 tw:overflow-hidden tw:whitespace-nowrap tw:text-ellipsis"
          >
            {{ scope.value }}
          </QTd>
        </template>
      </template>
    </WTable>
  </div>
</template>

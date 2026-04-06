import { defineComponent, ref, computed, h } from 'vue'
import { QRadio, QCheckbox, QInput, QTooltip } from 'quasar'
import { useValidation } from '@shared/composables/validator'
import WIcon from '../icon/WIcon'
import { forwardRefs } from '@shared/composables/forwardRef'
import { useRender } from '@shared/composables/render'
import { useTooltipData } from '@shared/composables/useTooltipData'
import './w-checklist.scss'
import OptionSetSelect from '@/components/common/OptionSetSelect.vue'

export default defineComponent({
  name: 'WChecklist',
  props: {
    /**
     * The model value - array of row values
     * For radio (uniform): ['col1', 'col2']
     * For mixed/checkbox: [{ col1: true }, { col1: false }]
     */
    modelValue: {
      type: Array,
      default: () => [],
    },
    /**
     * Array of row definitions
     * Each row should have: { value: string, label: string } OR be a string
     */
    rows: {
      type: Array,
      default: () => [],
      validator: (val) =>
        val.every(
          (row) => typeof row === 'string' || (row.value !== undefined && row.label !== undefined),
        ),
    },
    /**
     * Array of column definitions (headers)
     * Each column should have: { value: string, label: string, inputType?: string }
     */
    columns: {
      type: Array,
      default: () => [],
      validator: (val) => val.every((col) => col.value !== undefined && col.label !== undefined),
    },
    options: {
      type: Array,
      default: () => [],
    },
    /**
     * Function or string to get option label
     */
    optionLabel: {
      type: [Function, String],
      default: 'label',
    },
    /**
     * Function or string to get option value
     */
    optionValue: {
      type: [Function, String],
      default: 'value',
    },
    /**
     * Color for the input elements
     */
    color: {
      type: String,
      default: 'primary',
    },
    /**
     * Whether the table is disabled
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * Whether the table is read-only
     */
    readonly: {
      type: Boolean,
      default: false,
    },
    /**
     * Tooltip text
     */
    tooltip: {
      type: String,
      default: '',
    },
    /**
     * Tooltip CSS class
     */
    tooltipClass: {
      type: String,
      default: '',
    },
    /**
     * Data key for tooltip lookup
     */
    dataKey: {
      type: String,
      default: undefined,
    },
    /**
     * Error state
     */
    error: {
      type: Boolean,
      default: false,
    },
    /**
     * Error message to display
     */
    errorMessage: {
      type: String,
      default: undefined,
    },
    /**
     * Field name for validation
     */
    name: {
      type: String,
      default: undefined,
    },
    /**
     * Label for the table
     */
    label: {
      type: String,
      default: '',
    },
    /**
     * Hint text to display below the table
     */
    hint: {
      type: String,
      default: '',
    },
    /**
     * Dense mode for compact display
     */
    dense: {
      type: Boolean,
      default: false,
    },
    /**
     * Custom class for the table
     */
    tableClass: {
      type: String,
      default: '',
    },
    /**
     * Custom class for header cells
     */
    headerClass: {
      type: String,
      default: '',
    },
    /**
     * Custom class for row label cells
     */
    rowLabelClass: {
      type: String,
      default: '',
    },
    /**
     * Custom class for input cells
     */
    cellClass: {
      type: String,
      default: '',
    },
  },
  emits: ['update:modelValue'],
  setup(props, { attrs, emit }) {
    const root = ref()
    const validation = useValidation(props)
    const { computedTooltip, computedLabel: tooltipLabel } = useTooltipData(props)

    const computedLabel = computed(() => props.label || tooltipLabel.value)

    const tableRows = computed(() => {
      return (props.rows || []).map((row) => {
        if (typeof row === 'string') {
          return { label: row, value: row }
        }
        return row
      })
    })

    const hasUniformInputType = computed(() => {
      if (props.columns.length === 0) return true
      const firstType = props.columns[0].inputType || 'radio'
      return props.columns.every((col) => (col.inputType || 'radio') === firstType)
    })

    const handleSimpleCellChange = (rowIndex, colValue) => {
      if (props.disabled || props.readonly) return

      const newValue = [...props.modelValue]
      // Ensure array length matches rows
      while (newValue.length <= rowIndex) newValue.push(null)
      newValue[rowIndex] = colValue
      emit('update:modelValue', newValue)
    }

    const handleNestedCellChange = (rowIndex, colValue, value) => {
      if (props.disabled || props.readonly) return

      const newValue = [...props.modelValue]
      // Ensure array length matches rows
      while (newValue.length <= rowIndex) newValue.push({})

      const currentRow = newValue[rowIndex] || {}
      newValue[rowIndex] = { ...currentRow, [colValue]: value }

      emit('update:modelValue', newValue)
    }

    const getRowValue = (rowIndex) => {
      return props.modelValue[rowIndex]
    }

    const getCellValue = (rowIndex, colValue, defaultValue = undefined) => {
      const rowData = props.modelValue[rowIndex]
      if (rowData && typeof rowData === 'object') {
        return rowData[colValue] ?? defaultValue
      }
      return defaultValue
    }

    const getValue = (rowIndex, colValue, defaultValue = undefined) => {
      if (hasUniformInputType.value) {
        return getRowValue(rowIndex) ?? defaultValue
      }
      return getCellValue(rowIndex, colValue, defaultValue)
    }

    const handleValueChange = (rowIndex, colValue, value) => {
      if (hasUniformInputType.value) {
        handleSimpleCellChange(rowIndex, value)
      } else {
        handleNestedCellChange(rowIndex, colValue, value)
      }
    }

    const isCellSelected = (rowIndex, colValue) => {
      return props.modelValue[rowIndex] === colValue
    }

    /**
     * Render tooltip icon component
     */
    const TooltipComp = () =>
      h(WIcon, { name: 'sym_o_info', class: 'cursor-pointer q-ml-xs' }, () =>
        h(QTooltip, { maxWidth: '40%', class: props.tooltipClass }, () => computedTooltip.value),
      )

    /**
     * Render a radio input cell
     */
    const renderRadioCell = (row, col, index) => {
      return h(QRadio, {
        modelValue: getValue(index, col.value, null),
        val: col.value,
        color: props.color,
        disable: props.disabled,
        readonly: props.readonly,
        dense: props.dense,
        'onUpdate:modelValue': (val) => handleValueChange(index, col.value, val),
      })
    }

    /**
     * Render a checkbox input cell
     */
    const renderCheckboxCell = (row, col, index) => {
      return h(QCheckbox, {
        modelValue: getValue(index, col.value, false),
        color: props.color,
        disable: props.disabled,
        readonly: props.readonly,
        dense: props.dense,
        'onUpdate:modelValue': (val) => handleValueChange(index, col.value, val),
      })
    }

    /**
     * Render a text or number input cell
     */
    const renderInputCell = (row, col, index, type = 'text') => {
      return h(QInput, {
        modelValue: getValue(index, col.value, ''),
        type,
        dense: true,
        outlined: true,
        disable: props.disabled,
        readonly: props.readonly,
        placeholder: col.placeholder || '',
        min: col.min,
        max: col.max,
        step: col.step,
        class: `w-checklist__${type}-input`,
        'onUpdate:modelValue': (val) => handleValueChange(index, col.value, val),
      })
    }

    /**
     * Render a select/dropdown input cell
     */
    const renderSelectCell = (row, col, index) => {
      return h(OptionSetSelect, {
        modelValue: getValue(index, col.value, null),
        options: col.options || props.options,
        optionLabel: col.optionLabel || props.optionLabel,
        optionValue: col.optionValue || props.optionValue,
        optionSetId: col.optionSetId,
        dense: true,
        outlined: true,
        disable: props.disabled,
        readonly: props.readonly,
        emitValue: true,
        mapOptions: true,
        placeholder: col.placeholder || 'Select',
        class: 'w-checklist__select-input',
        'onUpdate:modelValue': (val) => handleValueChange(index, col.value, val),
      })
    }

    /**
     * Render a cell based on input type from column definition
     */
    const renderCell = (row, col, index) => {
      const inputType = col.inputType || 'radio'
      switch (inputType) {
        case 'checkbox':
          return renderCheckboxCell(row, col, index)
        case 'text':
          return renderInputCell(row, col, index, 'text')
        case 'number':
          return renderInputCell(row, col, index, 'number')
        case 'date':
          return renderInputCell(row, col, index, 'date')
        case 'time':
          return renderInputCell(row, col, index, 'time')
        case 'select':
        case 'dropdown':
          return renderSelectCell(row, col, index)
        case 'radio':
        default:
          return renderRadioCell(row, col, index)
      }
    }

    useRender(() => {
      // Create the label with tooltip if provided
      const LabelWithTooltip = () => {
        if (!computedLabel.value && !computedTooltip.value) return null

        return h('div', { class: 'row items-center q-mb-sm' }, [
          computedLabel.value ? h('span', { class: 'text-body1' }, computedLabel.value) : null,
          computedTooltip.value ? TooltipComp() : null,
        ])
      }

      // Render table header row
      const renderHeader = () => {
        const cells = [
          h('th', { class: `w-checklist__header-empty ${props.headerClass}` }),
          ...props.columns.map((col) =>
            h(
              'th',
              { class: `w-checklist__header-cell text-center ${props.headerClass}` },
              col.label,
            ),
          ),
        ]
        return h('tr', { class: 'w-checklist__header-row' }, cells)
      }

      // Render table body rows
      const renderRows = () => {
        return tableRows.value.map((row, idx) => {
          const cells = [
            h('td', { class: `w-checklist__row-label ${props.rowLabelClass}` }, row.label),
            ...props.columns.map((col) =>
              h(
                'td',
                { class: `w-checklist__cell text-center ${props.cellClass}` },
                renderCell(row, col, idx),
              ),
            ),
          ]

          return h('tr', { key: idx, class: 'w-checklist__row' }, cells)
        })
      }

      // Render the table
      const Table = () =>
        h(
          'table',
          {
            ref: root,
            class: `w-checklist ${props.tableClass} ${validation.error.value ? 'w-checklist--error' : ''}`,
          },
          [h('thead', {}, [renderHeader()]), h('tbody', {}, renderRows())],
        )

      // Render error message
      const ErrorMessage = () => {
        if (!validation.error.value || !validation.errorMessage.value) return null
        return h(
          'div',
          { class: 'text-negative text-caption q-mt-xs' },
          validation.errorMessage.value,
        )
      }

      // Render hint
      const Hint = () => {
        if (!props.hint) return null
        return h('div', { class: 'text-caption text-grey-6 q-mt-xs' }, props.hint)
      }

      return h(
        'div',
        {
          class: `w-checklist-wrapper ${props.disabled ? 'w-checklist--disabled' : ''}`,
          ...attrs,
        },
        [LabelWithTooltip(), Table(), ErrorMessage(), Hint()],
      )
    })

    return forwardRefs(
      {
        // Expose methods for external use
        getRowValue,
        getCellValue,
        isCellSelected,
      },
      root,
    )
  },
})

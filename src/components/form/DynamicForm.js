import { defineComponent, ref, computed, h } from 'vue'
import { useVModels } from '@vueuse/core'
import { getProp, injectMultipleProps, setProp } from '@shared/composables/object.js'
import { QForm, QInnerLoading, QSeparator, QSlider, QToggle, QRating, QExpansionItem } from 'quasar'
import WInput from '@shared/components/input/WInput.js'
import WColorPicker from '@shared/components/WColorPicker.vue'
import TextEditor from '@shared/components/Editor/TextEditor.vue'
import WDateTimeInput from '@shared/components/input/WDateTimeInput.js'
import OptionSetSelect from '@/components/common/OptionSetSelect.vue'
import OptionSetOptionGroup from '@/components/common/OptionSetOptionGroup.vue'
import WChecklist from '@shared/components/input/WChecklist.js'
import { useValidator } from '@shared/composables/validator.js'
import WCheckbox from '@shared/components/checkbox/WCheckbox.js'
import WBtn from '@shared/components/button/WBtn.js'
import WPhoto from '@shared/components/WPhoto.js'
import WUploader from '@/components/common/WUploader.vue'
import { required } from '@vuelidate/validators'

export default defineComponent({
  name: 'DynamicForm',
  props: {
    fields: {
      type: Array,
      required: true,
    },
    modelValue: {
      type: Object,
      default: () => ({}),
    },
    loading: {
      type: Boolean,
      default: undefined,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue', 'submit'],
  setup(props, { emit, slots, attrs }) {
    const { modelValue } = useVModels(props, emit)
    const innerLoading = ref(false)
    const collapsedSections = ref({})

    const computedLoading = computed({
      get: () => {
        if (typeof props.loading === 'boolean') {
          return props.loading
        }
        return innerLoading.value
      },
      set: (val) => (innerLoading.value = val),
    })

    function setFieldRule(field, initial) {
      let obj = initial
      if (field.name) {
        initial[field.name] = field.rules ?? {}
        obj = initial[field.name]

        if (field.required) {
          obj.required = required
        }
      }

      if ('children' in field && Array.isArray(field.children)) {
        field.children.forEach((child) => setFieldRule(child, obj))
      }

      if ('template' in field && Array.isArray(field.template)) {
        field.template.forEach((child) => setFieldRule(child, obj))
      }

      return initial
    }

    const rules = computed(() => {
      if (props.readonly) {
        return {}
      }
      const fields = props.fields
      return fields.reduce((acc, field) => setFieldRule(field, acc), {})
    })

    const validator = useValidator(rules, modelValue, {
      $autoDirty: false,
      $lazy: false,
      $rewardEarly: false,
    })

    // Check if field should be visible based on condition
    function isFieldVisible(field) {
      if (!field.condition) return true
      if (typeof field.condition === 'function') {
        return field.condition(modelValue.value)
      }
      return true
    }

    function getFieldScope(data) {
      const { path } = data

      injectMultipleProps(data, {
        value: {
          get: () => {
            return getProp(modelValue.value, path)
          },
          set: (value) => {
            if (!modelValue.value) {
              modelValue.value = {}
            }
            setProp(modelValue.value, path, value, true)
          },
        },
        modelValue: () => ({ ...modelValue.value }),
      })

      return data
    }

    // Repeater functions
    function addRepeaterItem(field, path) {
      const currentValue = getProp(modelValue.value, path) || []
      const maxItems = field.maxItems || Infinity
      if (currentValue.length < maxItems) {
        const newItem = {}
        // Initialize with default values from template
        if (field.template) {
          field.template.forEach((templateField) => {
            if (templateField.name && templateField.default !== undefined) {
              newItem[templateField.name] = templateField.default
            }
          })
        }
        setProp(modelValue.value, path, [...currentValue, newItem], true)
      }
    }

    function removeRepeaterItem(field, path, index) {
      const currentValue = getProp(modelValue.value, path) || []
      const minItems = field.minItems || 0
      if (currentValue.length > minItems) {
        const newValue = [...currentValue]
        newValue.splice(index, 1)
        setProp(modelValue.value, path, newValue, true)
      }
    }

    function createFieldComponent(field, scope) {
      const updateModelValueEvent = 'onUpdate:modelValue'

      const fieldProps = {
        ...field.props,
        name: scope.path,
        label: field.label,
        modelValue: scope.value,
        readonly: props.readonly || field.readonly,
        disable: props.disabled || field.disabled,
        [updateModelValueEvent]: (val) => {
          scope.value = val
          if (typeof field.props?.[updateModelValueEvent] === 'function') {
            field.props[updateModelValueEvent](val)
          }
        },
      }

      const inputFieldProps = {
        ...fieldProps,
        placeholder: field.placeholder,
        hint: field.hint,
        autogrow: field.autogrow,
      }

      const selectFieldProps = {
        optionLabel: 'label',
        optionValue: 'value',
        ...inputFieldProps,
        options: field.options,
      }

      switch (field.type) {
        case 'checkbox':
          return h(WCheckbox, fieldProps)

        case 'radio':
          return h(OptionSetOptionGroup, {
            ...selectFieldProps,
            type: 'radio',
            optionSetId: field.optionSetId,
          })

        case 'optionGroup':
          return h(OptionSetOptionGroup, {
            ...selectFieldProps,
            type: field.groupType,
            optionSetId: field.optionSetId,
            inline: field.inline,
          })

        case 'input':
        case 'textarea':
        case 'password':
          return h(WInput, {
            ...inputFieldProps,
            type: field.type,
          })

        case 'number':
          return h(WInput, {
            ...inputFieldProps,
            type: 'number',
            step: field.step,
            min: field.min,
            max: field.max,
          })

        case 'textEditor':
          return h(TextEditor, inputFieldProps)

        case 'datetime':
          return h(WDateTimeInput, { ...inputFieldProps, mode: field.mode })

        case 'colorPicker':
          return h('div', { class: 'tw:flex tw:flex-row' }, h(WColorPicker, fieldProps))

        case 'select':
          return h(OptionSetSelect, {
            ...selectFieldProps,
            optionSetId: field.optionSetId,
          })

        case 'slider':
          return h('div', { class: 'tw:px-2' }, [
            field.label
              ? h('div', { class: 'tw:text-xs tw:text-gray-600 tw:mb-1' }, field.label)
              : null,
            h(QSlider, {
              ...fieldProps,
              min: field.min ?? 0,
              max: field.max ?? 100,
              step: field.step ?? 1,
              label: true,
              labelAlways: field.labelAlways,
              markers: field.markers,
            }),
          ])

        case 'toggle':
          return h(QToggle, {
            ...fieldProps,
            label: field.label,
            color: field.color || 'primary',
          })

        case 'file':
          return h(WUploader, {
            ...fieldProps,
            fileType: field.fileType || 'ASSET',
            accept: field.accept || 'image/*,video/*,application/pdf,.docx,.doc',
            label: field.label || 'Supporting Documents',
            maxSize: field.maxSize || 100 * 1024 * 1024,
            multiple: field.multiple !== false,
            required: field.required || false,
          })

        case 'rating':
          return h('div', { class: 'tw:py-1' }, [
            field.label
              ? h('div', { class: 'tw:text-xs tw:text-gray-600 tw:mb-1' }, field.label)
              : null,
            h(QRating, {
              ...fieldProps,
              max: field.max ?? 5,
              size: field.size || 'md',
              color: field.color || 'primary',
              icon: field.icon || 'star_border',
              iconSelected: field.iconSelected || 'star',
            }),
          ])

        case 'checklist':
          return h(WChecklist, {
            ...fieldProps,
            rows: field.rows || [],
            columns: field.columns || [],
            options: field.options || [],
            optionLabel: field.optionLabel,
            optionValue: field.optionValue,
            hint: field.hint,
            dense: field.dense,
            tableClass: field.tableClass,
            headerClass: field.headerClass,
            rowLabelClass: field.rowLabelClass,
            cellClass: field.cellClass,
          })

        case 'photo':
          return h(WPhoto, {
            ...fieldProps,
            mode: field.mode,
            accept: field.accept,
            maxFileSize: field.maxFileSize,
            placeholder: field.placeholder,
            previewSize: field.previewSize,
            facingMode: field.facingMode,
          })

        default:
          return h(
            'div',
            { class: 'tw:text-red-500' },
            `Invalid Field.type "${field.type}" at "${scope.path}"`,
          )
      }
    }

    function createRepeaterField(field, ancestors) {
      const path = [...ancestors, field.name].join('.')
      const items = getProp(modelValue.value, path) || []
      const minItems = field.minItems || 0
      const maxItems = field.maxItems || Infinity

      // Initialize with minimum items if empty
      if (items.length === 0 && minItems > 0) {
        const initialItems = Array.from({ length: minItems }, () => ({}))
        setProp(modelValue.value, path, initialItems, true)
      }

      const repeaterItems = items.map((item, itemIndex) => {
        const itemFields = field.template.map((templateField, fieldIndex) =>
          createField(templateField, [path, String(itemIndex)], fieldIndex),
        )

        return h(
          'div',
          {
            key: itemIndex,
            class: 'repeater-item tw:p-4 tw:mb-2 tw:bg-gray-50 tw:rounded',
          },
          [
            h('div', { class: 'tw:flex tw:flex-row tw:items-center tw:mb-2' }, [
              h(
                'div',
                { class: 'tw:text-sm tw:font-medium' },
                `${field.itemLabel || 'Item'} ${itemIndex + 1}`,
              ),
              h('div', { class: 'tw:flex-1' }),
              !props.readonly && !props.disabled && items.length > minItems
                ? h(WBtn, {
                    flat: true,
                    round: true,
                    dense: true,
                    icon: 'delete',
                    color: 'negative',
                    onClick: () => removeRepeaterItem(field, path, itemIndex),
                  })
                : null,
            ]),
            h('div', { class: 'tw:flex tw:flex-col tw:gap-2' }, itemFields),
          ],
        )
      })

      return h('div', { class: ['repeater-field', field.class], style: field.style }, [
        field.label ? h('div', { class: 'tw:text-base tw:mb-2' }, field.label) : null,
        ...repeaterItems,
        !props.readonly && !props.disabled && items.length < maxItems
          ? h(WBtn, {
              flat: true,
              icon: 'add',
              label: field.addLabel || 'Add Item',
              color: 'primary',
              class: 'tw:mt-2',
              onClick: () => addRepeaterItem(field, path),
            })
          : null,
      ])
    }

    function createSectionField(field, ancestors, index) {
      const sectionKey = field.name || `section-${index}`
      const isCollapsed = collapsedSections.value[sectionKey] ?? field.collapsed ?? false
      const sectionAncestors = field.name ? [...ancestors, field.name] : ancestors

      if (field.collapsible) {
        return h(
          QExpansionItem,
          {
            modelValue: !isCollapsed,
            'onUpdate:modelValue': (val) => {
              collapsedSections.value[sectionKey] = !val
            },
            label: field.label,
            headerClass: 'tw:text-base tw:bg-gray-200',
            expandIconClass: 'tw:text-gray-700',
            class: ['section-field tw:mb-4', field.class],
            style: field.style,
          },
          () =>
            h(
              'div',
              { class: 'tw:p-4 tw:flex tw:flex-col tw:gap-4' },
              createFields(field.children, sectionAncestors),
            ),
        )
      }

      return h('div', { class: ['section-field tw:mb-4', field.class], style: field.style }, [
        h('div', { class: 'tw:text-base tw:mb-4 tw:font-medium' }, field.label),
        h(
          'div',
          { class: 'tw:flex tw:flex-col tw:gap-4' },
          createFields(field.children, sectionAncestors),
        ),
      ])
    }

    function createField(field, ancestors, index) {
      // Check visibility condition
      if (!isFieldVisible(field)) {
        return null
      }

      if (field.type === 'separator') {
        return h(QSeparator, field.props)
      }

      if (field.type === 'section') {
        return createSectionField(field, ancestors, index)
      }

      if (field.type === 'repeater') {
        return createRepeaterField(field, ancestors, index)
      }

      if (!field.name && !['row', 'column'].includes(field.type)) {
        return h(
          'div',
          { class: 'tw:text-red-500' },
          `Field name is required at ${ancestors}.[${index}]`,
        )
      }

      ancestors = field.name ? [...ancestors, field.name] : ancestors

      const path = ancestors.join('.')
      const slotName = `field-${path}`
      const scope = getFieldScope({ field, path, index })
      const slot = slots[slotName]

      if (slot !== void 0) {
        return slot(scope)
      }

      if (field.type === 'row' || field.type === 'column') {
        const fieldClass = `${field.type === 'row' ? 'tw:flex tw:flex-row' : 'tw:flex tw:flex-col'} tw:gap-4 tw:m-0`

        return h(
          'div',
          {
            ...field.props,
            key: field.name,
            class: [fieldClass, field.class],
            style: field.style,
          },
          createFields(field.children, ancestors),
        )
      }

      const prependSlot = slots[`${slotName}-prepend`]
      const appendSlot = slots[`${slotName}-append`]
      const internalAppendSlot = slots[`${slotName}-internal-append`]

      // Field types that support internal append slots
      const supportsInternalAppend = ['input', 'select', 'number', 'password', 'textarea']

      // Create component slots for fields that support internal append
      const componentSlots = {}
      if (supportsInternalAppend.includes(field.type) && internalAppendSlot) {
        componentSlots.append = internalAppendSlot
      }

      const Comp = createFieldComponent(field, scope, componentSlots)

      if (Comp) {
        const inner = [Comp]

        if (prependSlot) {
          inner.unshift(prependSlot())
        }

        // Add regular append slot outside the field
        if (appendSlot) {
          inner.push(appendSlot())
        }

        return h('div', { class: field.class, style: field.style }, inner)
      } else {
        return Comp
      }
    }

    function createFields(fields, ancestors = []) {
      if (!fields) {
        return []
      }

      return fields
        .map((field, index) => createField(field, ancestors, index))
        .filter((field) => field !== null)
    }

    async function submit(e) {
      e.preventDefault()
      computedLoading.value = true
      const isValid = await validator.value.$validate()

      if (isValid) {
        emit('submit', modelValue.value, () => {
          computedLoading.value = false
        })
      } else {
        computedLoading.value = false
      }
    }

    return () => {
      const contents = []

      if (slots.header) {
        contents.push(slots.header())
      }

      contents.push(h('div', { class: 'tw:flex tw:flex-col tw:gap-4' }, createFields(props.fields)))

      if (slots.footer) {
        contents.push(slots.footer())
      }

      contents.push(h(QInnerLoading, { showing: computedLoading.value, color: 'primary' }))

      return h(
        QForm,
        {
          ...attrs,
          onSubmit: submit,
          class: [attrs.class, 'tw:flex tw:flex-col tw:gap-4 dynamic-form'],
        },
        () => contents,
      )
    }
  },
})

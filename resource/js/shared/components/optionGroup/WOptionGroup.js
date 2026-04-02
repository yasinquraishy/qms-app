import { defineComponent, ref, computed, h } from 'vue'
import { QOptionGroup, QTooltip } from 'quasar'
import { useValidation } from '@shared/composables/validator'
import WIcon from '../icon/WIcon'
import { forwardRefs } from '@shared/composables/forwardRef'
import { useRender } from '@shared/composables/render'
import { useTooltipData } from '@shared/composables/useTooltipData'

export default defineComponent({
  name: 'WOptionGroup',
  props: {
    modelValue: {
      type: [String, Number, Boolean, Array],
      default: undefined,
    },
    options: {
      type: Array,
      default: () => [],
    },
    optionLabel: {
      type: [Function, String],
      default: 'label',
    },
    optionValue: {
      type: [Function, String],
      default: 'value',
    },
    inline: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: 'primary',
    },
    type: {
      type: String,
      default: 'radio',
      validator: (val) => ['radio', 'checkbox', 'toggle'].includes(val),
    },
    tooltip: {
      type: String,
      default: '',
    },
    tooltipClass: {
      type: String,
      default: '',
    },
    dataKey: {
      type: String,
      default: undefined,
    },
    error: {
      type: Boolean,
      default: false,
    },
    errorMessage: {
      type: String,
      default: undefined,
    },
    name: {
      type: String,
      default: undefined,
    },
    label: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '',
    },
    hint: {
      type: String,
      default: '',
    },
  },
  setup(props, { attrs, slots, emit }) {
    const root = ref()
    const validation = useValidation(props)
    const { computedTooltip, computedLabel: tooltipLabel } = useTooltipData(props)

    const computedLabel = computed(() => props.label || tooltipLabel.value)

    // Helper function to get option value
    const getOptionValue = (option) => {
      if (typeof option === 'string') return option
      if (typeof props.optionValue === 'function') {
        return props.optionValue(option)
      }
      return option[props.optionValue]
    }

    // Helper function to get option label
    const getOptionLabel = (option) => {
      if (typeof option === 'string') return option
      if (typeof props.optionLabel === 'function') {
        return props.optionLabel(option)
      }
      return option[props.optionLabel]
    }

    const handleUpdateModelValue = (val) => {
      emit('update:modelValue', val)
    }

    const TooltipComp = () =>
      h(WIcon, { name: 'sym_o_info', class: 'cursor-pointer q-ml-xs' }, () =>
        h(QTooltip, { maxWidth: '40%', class: props.tooltipClass }, () => computedTooltip.value),
      )

    watch(
      () => props.type,
      (newType) => {
        if (['checkbox', 'toggle'].includes(newType) && !Array.isArray(props.modelValue)) {
          emit(
            'update:modelValue',
            props.modelValue !== undefined && props.modelValue !== null ? [props.modelValue] : [],
          )
        }
      },
      { immediate: true },
    )

    useRender(() => {
      const isMultiple = ['checkbox', 'toggle'].includes(props.type)
      const safeModelValue = isMultiple && !Array.isArray(props.modelValue) ? [] : props.modelValue

      const optionGroupProps = {
        ...attrs,
        ref: root,
        modelValue: safeModelValue,
        options: props.options.map((option) => ({
          label: getOptionLabel(option),
          value: getOptionValue(option),
          ...option,
        })),
        inline: props.inline,
        color: props.color,
        type: props.type,
        error: validation.error.value,
        'onUpdate:modelValue': handleUpdateModelValue,
      }

      // Only add name if it's provided
      if (props.name) {
        optionGroupProps.name = props.name
      }

      // Create the label with tooltip if provided
      const LabelWithTooltip = () => {
        if (!computedLabel.value && !computedTooltip.value) return null

        return h('div', { class: 'q-ml-sm row items-center q-mb-sm' }, [
          computedLabel.value ? h('span', { class: 'text-body1' }, computedLabel.value) : null,
          computedTooltip.value ? TooltipComp() : null,
        ])
      }

      return h('div', { class: 'w-option-group' }, [
        LabelWithTooltip(),
        h(QOptionGroup, optionGroupProps, slots),
        props.hint ? h('div', { class: 'text-caption text-grey-6 q-mt-xs' }, props.hint) : null,
      ])
    })

    return forwardRefs({}, root)
  },
})

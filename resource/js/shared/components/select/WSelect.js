import { defineComponent, ref, computed, onMounted, h } from 'vue'
import { QSelect, QTooltip } from 'quasar'
import { useValidation } from '@shared/composables/validator'
import { getPropValueFn } from '@shared/composables/props'
import WIcon from '../icon/WIcon'
import { forwardRefs } from '@shared/composables/forwardRef'
import { useRender } from '@shared/composables/render'
import { useTooltipData } from '@shared/composables/useTooltipData'

export default defineComponent({
  name: 'WSelect',
  props: {
    noDense: {
      type: Boolean,
      default: false,
    },
    noOutlined: {
      type: Boolean,
      default: false,
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
    options: {
      type: Array,
      default: () => [],
    },
    optionLabel: {
      type: [Function, String],
      default: 'text',
    },
    optionValue: {
      type: [Function, String],
      default: 'value',
    },
    onInputValue: {
      type: Function,
      default: undefined,
    },
    inputDebounce: {
      type: [Number, String],
      default: 0,
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
    placeholder: {
      type: String,
      default: '',
    },
    label: {
      type: String,
      default: '',
    },
    hideOnSelect: {
      type: Boolean,
      default: false,
    },
    hideBottomSpace: {
      type: Boolean,
      default: undefined,
    },
    multiple: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { attrs, slots, emit }) {
    const root = ref()
    const validation = useValidation(props)
    const search = ref('')

    // returns method to get value of an option;
    // takes into account 'option-value' prop
    const getOptionValue = computed(() => getPropValueFn(props.optionValue, 'value'))

    // returns method to get label of an option;
    // takes into account 'option-label' prop
    const getOptionLabel = computed(() => getPropValueFn(props.optionLabel, 'label'))

    const { computedTooltip, computedPlaceholder, computedLabel } = useTooltipData(props)

    const filteredOptions = computed(() => {
      if (Array.isArray(props.options) && search.value) {
        return props.options.filter((opt) => {
          const label = getOptionLabel.value(opt).toString()
          const value = getOptionValue.value(opt).toString()

          return (
            label.toLowerCase().includes(search.value.toLowerCase()) ||
            value.toLowerCase().includes(search.value.toLowerCase())
          )
        })
      }

      return props.options
    })

    function onInputValue(val) {
      if (typeof val === 'string') {
        search.value = val
      }
    }

    function onUpdateModelValue(val) {
      emit('update:modelValue', val)
      search.value = ''
      if (props.hideOnSelect) {
        root.value?.hidePopup()
      }
    }

    onMounted(() => {
      search.value = ''
    })

    watch(
      () => props.multiple,
      (newVal) => {
        const mv = attrs.modelValue
        if (newVal && !Array.isArray(mv)) {
          emit('update:modelValue', mv !== null && mv !== undefined ? [mv] : [])
        } else if (!newVal && Array.isArray(mv)) {
          emit('update:modelValue', mv.length > 0 ? mv[0] : null)
        }
      },
    )

    const TooltipComp = () =>
      h(WIcon, { name: 'sym_o_info', class: 'cursor-pointer' }, () =>
        h(QTooltip, { maxWidth: '40%', class: props.tooltipClass }, () => computedTooltip.value),
      )

    useRender(() =>
      h(
        QSelect,
        {
          ...props,
          ...attrs,
          ref: root,
          options: filteredOptions.value,
          dense: !props.noDense,
          outlined: !props.noOutlined,
          error: validation.error.value,
          errorMessage: validation.errorMessage.value,
          onInputValue: props.onInputValue ?? onInputValue,
          inputDebounce: props.inputDebounce,
          noErrorIcon: Boolean(computedTooltip.value),
          'onUpdate:modelValue': onUpdateModelValue,
          hideBottomSpace:
            typeof props.hideBottomSpace === 'boolean'
              ? props.hideBottomSpace
              : !validation.error.value,
          placeholder: computedPlaceholder.value || props.placeholder,
          label: computedLabel.value || props.label || undefined,
          useChips: props.multiple || attrs.multiple || false,
        },
        {
          ...slots,
          append: computedTooltip.value
            ? slots.append
              ? () => [slots.append?.(), TooltipComp()]
              : TooltipComp
            : slots.append,
        },
      ),
    )

    return forwardRefs({}, root)
  },
})

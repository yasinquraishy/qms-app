import { useRender } from '@shared/composables/render'
import { QCheckbox, QTooltip, QField } from 'quasar'
import { defineComponent, h, ref, computed } from 'vue'
import WIcon from '../icon/WIcon'
import { useValidation } from '@shared/composables/validator'
import { forwardRefs } from '@shared/composables/forwardRef'
import { useTooltipData } from '@shared/composables/useTooltipData'

export default defineComponent({
  name: 'WCheckbox',
  props: {
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
    label: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '',
    },
    modelValue: {
      type: [Boolean, String, Number, null, Array],
      default: false,
    },
    val: {
      type: [String, Number, Boolean, Object],
      default: null,
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
      default: '',
    },
    hideBottomSpace: {
      type: Boolean,
      default: undefined,
    },
    rules: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['update:modelValue'],
  setup(props, { attrs, slots, emit }) {
    const root = ref()
    const fieldRef = ref()
    const validation = useValidation(props)

    const { computedTooltip, computedLabel } = useTooltipData(props)

    // Compute the actual model value for the checkbox
    const isChecked = computed(() => {
      // For array models, check if the array includes the val
      if (Array.isArray(props.modelValue)) {
        if (props.val === null || props.val === undefined) {
          return false
        }

        return props.modelValue.includes(props.val)
      }

      // For regular boolean values or falsy values
      return !!props.modelValue
    })

    // Compute if the value should be indeterminate
    const indeterminate = computed(() => {
      if (!props.modelValue || Array.isArray(props.modelValue)) {
        return false
      }

      return attrs.indeterminate || false
    })

    // Handle the change event
    const onChange = (val) => {
      if (Array.isArray(props.modelValue) && props.val !== null && props.val !== undefined) {
        const model = [...props.modelValue]
        const index = model.indexOf(props.val)

        if (val) {
          if (index === -1) {
            model.push(props.val)
          }
        } else if (index > -1) {
          model.splice(index, 1)
        }

        emit('update:modelValue', model)
      } else {
        emit('update:modelValue', val)
      }

      // Trigger field validation
      fieldRef.value?.validate()
    }

    useRender(() => {
      const Tooltip = () =>
        h(WIcon, { name: 'sym_o_info', class: 'cursor-pointer' }, () =>
          h(QTooltip, { maxWidth: '40%', class: props.tooltipClass }, () => computedTooltip.value),
        )

      const CheckboxContent = () =>
        h(
          QCheckbox,
          {
            ...attrs,
            modelValue: isChecked.value,
            indeterminate: indeterminate.value,
            'onUpdate:modelValue': onChange,
            val: props.val,
            ref: root,
            class: ['w-checkbox__input', attrs.class],
          },
          {
            ...slots,
            default: slots.default
              ? slots.default
              : () =>
                  h('div', { class: 'inline' }, [
                    h('span', { class: 'q-mr-xs' }, computedLabel.value || props.label),
                    computedTooltip.value ? Tooltip() : undefined,
                  ]),
          },
        )

      return h(
        QField,
        {
          ref: fieldRef,
          modelValue: props.modelValue,
          rules: props.rules,
          error: validation.error.value,
          errorMessage: validation.errorMessage.value,
          borderless: true,
          dense: true,
          hideBottomSpace:
            typeof props.hideBottomSpace === 'boolean'
              ? props.hideBottomSpace
              : !validation.error.value,
        },
        {
          control: () => CheckboxContent(),
        },
      )
    })

    return forwardRefs({ validate: () => fieldRef.value?.validate() }, root)
  },
})

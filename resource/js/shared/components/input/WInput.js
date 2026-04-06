import { get } from '@vueuse/core'
import { QIcon, QInput, QTooltip } from 'quasar'
import { defineComponent, computed, ref, shallowRef, h } from 'vue'
import { useValidation } from '@shared/composables/validator'
import WIcon from '../icon/WIcon'
import { forwardRefs } from '@shared/composables/forwardRef'
import { useRender } from '@shared/composables/render'
import { useTooltipData } from '@shared/composables/useTooltipData'

export default defineComponent({
  name: 'WInput',
  props: {
    noOutline: {
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
      default: '',
    },
    type: {
      type: String,
      default: 'text',
    },
    passwordVisibilityIcon: {
      type: String,
      default: 'sym_o_visibility',
    },
    passwordVisibilityOffIcon: {
      type: String,
      default: 'sym_o_visibility_off',
    },
    mask: {
      type: [String, Object],
      default: undefined,
    },
    autocomplete: {
      type: String,
      default: undefined,
    },
    tooltip: {
      type: String,
      default: '',
    },
    tooltipClass: {
      type: String,
      default: '',
    },
    hideBottomSpace: {
      type: Boolean,
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
  },
  setup(props, { attrs, slots, emit }) {
    const root = ref()
    const validation = useValidation(props)
    const isPasswordVisible = shallowRef(false)

    const passwordIcon = computed(() =>
      isPasswordVisible.value ? props.passwordVisibilityIcon : props.passwordVisibilityOffIcon,
    )

    const { computedTooltip, computedPlaceholder, computedLabel, computedhelplinkkey } =
      useTooltipData(props)

    function togglePasswordVisibility() {
      isPasswordVisible.value = !isPasswordVisible.value
    }

    const isPasswordType = computed(() => props.type === 'password')

    const computedType = computed(() => {
      if (isPasswordType.value) {
        return isPasswordVisible.value ? 'text' : 'password'
      }

      return props.type
    })

    function handleTooltipClick() {
      if (computedhelplinkkey.value) {
        emit('open-help', computedhelplinkkey.value)
      }
    }

    const PasswordIconComp = () =>
      h(QIcon, {
        name: passwordIcon.value,
        onClick: togglePasswordVisibility,
        class: 'cursor-pointer',
      })

    const TooltipComp = () =>
      h(
        'span',
        {
          style: 'display: inline-flex; align-items: center;',
          onClick: computedhelplinkkey.value ? handleTooltipClick : undefined,
          class: computedhelplinkkey.value ? 'cursor-pointer' : '',
        },
        [
          h(WIcon, {
            name: computedhelplinkkey.value ? 'sym_o_help' : 'sym_o_info',
            class: 'cursor-pointer',
          }),
          h(QTooltip, { maxWidth: '40%', class: props.tooltipClass }, () => computedTooltip.value),
        ],
      )

    const Append = () => {
      const inner = [
        computedTooltip.value ? TooltipComp : undefined,
        isPasswordType.value ? PasswordIconComp : undefined,
      ].filter(Boolean)

      return () => [slots.append?.(), ...inner.map((comp) => comp())]
    }

    useRender(() =>
      h(
        QInput,
        {
          ...props,
          ...attrs,
          class: ['w-input', attrs.class],
          dense: true,
          outlined: !props.noOutline,
          error: validation.error.value,
          errorMessage: validation.errorMessage.value,
          type: computedType.value,
          mask: get(props.mask),
          autocomplete: props.autocomplete ?? (isPasswordType.value ? 'new-password' : undefined),
          hideBottomSpace:
            typeof props.hideBottomSpace === 'boolean'
              ? props.hideBottomSpace
              : !validation.error.value,
          placeholder: computedPlaceholder.value || props.placeholder,
          label: computedLabel.value || props.label || undefined,
          ref: root,
        },
        {
          ...slots,
          append: Append(),
        },
      ),
    )

    return forwardRefs({}, root)
  },
})

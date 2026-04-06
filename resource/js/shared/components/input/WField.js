import { QField } from 'quasar'
import { defineComponent, ref, h } from 'vue'
import { useValidation } from '@shared/composables/validator'
import { forwardRefs } from '@shared/composables/forwardRef'
import { useRender } from '@shared/composables/render'

export default defineComponent({
  name: 'WField',
  inheritAttrs: false,
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
      default: '',
    },
    hideBottomSpace: {
      type: Boolean,
      default: undefined,
    },
  },
  setup(props, { attrs, slots }) {
    const root = ref()
    const validation = useValidation(props)

    useRender(() =>
      h(
        QField,
        {
          ...props,
          ...attrs,
          dense: !props.noDense,
          outlined: !props.noOutlined,
          error: validation.error.value,
          errorMessage: validation.errorMessage.value,
          ref: root,
          hideBottomSpace:
            typeof props.hideBottomSpace === 'boolean'
              ? props.hideBottomSpace
              : !validation.error.value,
        },
        slots,
      ),
    )

    return forwardRefs({}, root)
  },
})

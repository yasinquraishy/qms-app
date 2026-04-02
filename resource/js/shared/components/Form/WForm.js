import { defineComponent, ref, h } from 'vue'
import { QForm } from 'quasar'
import { forwardRefs } from '@shared/composables/forwardRef'
import { useRender } from '@shared/composables/render'

const WForm = defineComponent({
  name: 'WForm',
  inheritAttrs: false,
  props: {
    noGreedy: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { attrs, slots }) {
    const root = ref()

    useRender(() =>
      h(
        QForm,
        {
          ...props,
          ...attrs,
          greedy: !props.noGreedy,
          ref: root,
        },
        slots,
      ),
    )

    return forwardRefs(
      {
        validate: () => root.value?.validate(),
        resetValidation: () => root.value?.resetValidation(),
        submit: (evt) => root.value?.submit(evt),
        focus: () => root.value?.focus(),
      },
      root,
    )
  },
})

export default WForm

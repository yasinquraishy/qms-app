import { QAvatar, QTooltip } from 'quasar'
import { computed, defineComponent, h, ref } from 'vue'
import { forwardRefs } from '@shared/composables/forwardRef'
import { useRender } from '@shared/composables/render'

export default defineComponent({
  name: 'WAvatar',
  inheritAttrs: false,
  props: {
    color: {
      type: [String, null],
      default: 'primary',
    },
    tooltip: {
      type: String,
      default: undefined,
    },
    tonal: {
      type: Boolean,
      default: false,
    },
    textColor: {
      type: String,
      default: undefined,
    },
  },
  setup(props, { slots, attrs }) {
    const root = ref()

    const qAvatarClass = computed(() => ({
      'w-tonal': props.tonal,
    }))

    const TooltipComp = () => h(QTooltip, {}, () => props.tooltip)
    const FocusHelper = () => h('span', { class: 'q-focus-helper', tabindex: '-1' })
    const DefaultSlot = () => [
      FocusHelper(),
      slots.default?.(),
      props.tooltip ? TooltipComp() : null,
    ]

    useRender(() =>
      h(
        QAvatar,
        {
          ...props,
          ...attrs,
          class: ['w-avatar q-focusable', attrs.class, qAvatarClass.value],
          color: props.tonal ? 'white' : props.color, // if the prop is tonal, set the color to white
          textColor: props.tonal ? props.color : props.textColor, // if the prop is tonal, set the text color to the color prop
          ref: root,
        },
        {
          ...slots,
          default: DefaultSlot,
        },
      ),
    )

    return forwardRefs({}, root)
  },
})

import { QBtn, QTooltip } from 'quasar'
import { computed, defineComponent, h, ref } from 'vue'
import { forwardRefs } from '@shared/composables/forwardRef'
import { useRender } from '@shared/composables/render'

export default defineComponent({
  name: 'WBtn',
  inheritAttrs: false,
  props: {
    color: {
      type: [String, null],
      default: 'primary',
    },
    size: {
      type: [String, Number],
      default: '0.875rem',
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

    const qBtnClass = computed(() => ({
      'w-tonal': props.tonal,
    }))

    const TooltipComp = () => h(QTooltip, {}, () => props.tooltip)

    useRender(() =>
      h(
        QBtn,
        {
          ...props,
          ...attrs,
          class: ['w-btn', attrs.class, qBtnClass.value],
          color: props.tonal ? 'white' : props.color, // if the prop is tonal, set the color to white
          textColor: props.tonal ? props.color : props.textColor, // if the prop is tonal, set the text color to the color prop
          ref: root,
        },
        {
          ...slots,
          default: props.tooltip
            ? slots.default
              ? () => [slots.default?.(), TooltipComp()]
              : TooltipComp
            : slots.default,
        },
      ),
    )

    return forwardRefs({}, root)
  },
})

import { defineComponent, computed, ref, h } from 'vue'
import { QIcon } from 'quasar'
import { Icon } from '@iconify/vue'
import { forwardRefs } from '@shared/composables/forwardRef'
import { useRender } from '@shared/composables/render'

export default defineComponent({
  name: 'WIcon',
  props: {
    icon: {
      type: String,
      default: undefined,
    },
    size: {
      type: String,
      default: '22px',
    },
    color: {
      type: [String, null],
      default: undefined,
    },
    tonal: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { attrs, slots }) {
    const root = ref()

    const isIconify = computed(
      () => !!props.icon && (props.icon.includes('-') || props.icon.includes(':')),
    )

    const qIconClass = computed(() => ({
      'w-tonal': props.tonal,
    }))

    const computedColor = computed(() => {
      if (props.tonal) return 'white'
      return props.color
    })

    useRender(() =>
      h(
        QIcon,
        {
          ...props,
          ...attrs,
          icon: undefined,
          name: isIconify.value ? undefined : props.icon,
          color: computedColor.value,
          class: ['w-icon', attrs.class, qIconClass.value],
          ref: root,
        },
        {
          ...slots,
          default: isIconify.value
            ? slots.default
              ? () => [h(Icon, { icon: props.icon }), slots.default?.()]
              : () => h(Icon, { icon: props.icon })
            : slots.default,
        },
      ),
    )

    return forwardRefs({}, root)
  },
})

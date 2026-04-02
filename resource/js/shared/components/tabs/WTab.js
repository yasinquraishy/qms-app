import { defineComponent, ref, h } from 'vue'
import { QRouteTab, QTab } from 'quasar'
import { forwardRefs } from '@shared/composables/forwardRef'
import { useRender } from '@shared/composables/render'

export default defineComponent({
  name: 'WTab',
  props: {
    to: {
      type: [String, Object],
      default: undefined,
    },
    href: {
      type: String,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    const root = ref()

    useRender(() =>
      props.href !== undefined || props.to !== undefined
        ? h(QRouteTab, { ...props, ref: root }, slots)
        : h(QTab, { ...props, ref: root }, slots),
    )

    return forwardRefs({}, root)
  },
})

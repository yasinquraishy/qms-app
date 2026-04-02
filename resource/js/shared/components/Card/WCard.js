import { QCard } from 'quasar'
import { defineComponent, h } from 'vue'

export default defineComponent({
  name: 'WCard',
  inheritAttrs: false,
  props: {},
  setup(props, { attrs, slots }) {
    return () => h(QCard, { ...props, ...attrs }, slots)
  },
})

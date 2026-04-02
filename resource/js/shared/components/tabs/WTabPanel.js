import { defineComponent, ref, h } from 'vue'
import { QTabPanel } from 'quasar'
import { forwardRefs } from '@shared/composables/forwardRef'
import { useRender } from '@shared/composables/render'

export default defineComponent({
  name: 'WTabPanel',
  setup(props, { slots }) {
    const root = ref()

    useRender(() => h(QTabPanel, { ...props, ref: root }, slots))

    return forwardRefs({}, root)
  },
})

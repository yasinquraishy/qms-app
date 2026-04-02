import { defineComponent, ref, h } from 'vue'
import { QTabPanels } from 'quasar'
import WTabPanel from './WTabPanel'
import { forwardRefs } from '@shared/composables/forwardRef'
import { useRender } from '@shared/composables/render'

export default defineComponent({
  name: 'WTabPanels',
  props: {
    panels: {
      type: Array,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    const root = ref()

    function createTabPanel(panel, idx) {
      const name = panel.name ?? idx

      return h(
        WTabPanel,
        { name, key: name, class: ['q-pa-none', panel.class] },
        h(panel.component),
      )
    }

    const Panels = () => props.panels?.map(createTabPanel)

    useRender(() =>
      h(
        QTabPanels,
        { ...props, animated: true, ref: root },
        slots.default ? slots.default : Array.isArray(props.panels) ? Panels : undefined,
      ),
    )

    return forwardRefs({}, root)
  },
})

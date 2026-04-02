import { defineComponent, ref, h } from 'vue'
import { QTabs } from 'quasar'
import WTab from './WTab'
import { forwardRefs } from '@shared/composables/forwardRef'
import { useRender } from '@shared/composables/render'

export default defineComponent({
  name: 'WTabs',
  props: {
    noDense: {
      type: Boolean,
      default: false,
    },
    baseColor: {
      type: String,
      default: 'primary',
    },
    align: {
      type: String,
      default: 'left',
    },
    tabs: {
      type: Array,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    const root = ref()

    function createTab(tab, idx) {
      const name = tab.name ?? idx

      return h(WTab, { ...tab, name, key: name })
    }

    const Tabs = () => props.tabs?.map(createTab)

    useRender(() =>
      h(
        QTabs,
        { ...props, dense: !props.noDense, ref: root },
        {
          ...slots,
          default: slots.default ? slots.default : Array.isArray(props.tabs) ? Tabs : undefined,
        },
      ),
    )

    return forwardRefs({}, root)
  },
})

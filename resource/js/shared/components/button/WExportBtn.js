import { defineComponent, h, ref } from 'vue'
import WBtn from './WBtn'
import { exportFile, QItem, QItemSection, QList, QMenu } from 'quasar'
import { useToast } from '@/composable/useToast'
import { forwardRefs } from '@shared/composables/forwardRef'
import { useRender } from '@shared/composables/render'

function wrapCsvValue(val, formatFn, row) {
  let formatted = formatFn !== void 0 ? formatFn(val, row) : val

  formatted = formatted == void 0 || formatted == null ? '' : String(formatted)

  formatted = formatted.split('"').join('""')
  return `"${formatted}"`
}

export default defineComponent({
  name: 'WExportBtn',
  props: {
    fileName: {
      type: String,
      required: true,
    },
    data: {
      type: [Object, String, Array],
      default: undefined,
    },
    format: {
      type: String,
      default: 'csv',
    },
    menuItems: {
      type: Array,
      default: undefined,
    },
  },
  setup(props, { slots, attrs }) {
    const root = ref()
    const toast = useToast()
    const menu = ref(false)
    const loading = ref(false)

    function exportCsv({ columns, rows }) {
      // naive encoding to csv format
      const content = [columns.map((col) => wrapCsvValue(col.label))]
        .concat(
          rows.map((row) =>
            columns
              .map((col) =>
                wrapCsvValue(
                  typeof col.field === 'function'
                    ? col.field(row)
                    : row[col.field == void 0 ? col.name : col.field],
                  col.format,
                  row,
                ),
              )
              .join(','),
          ),
        )
        .join('\r\n')

      const status = exportFile(`${props.fileName}.csv`, content, 'text/csv')

      if (status !== true) {
        toast.e('Browser denied file download...')
      }
    }

    function exportData(data) {
      if (props.format === 'csv' && !Array.isArray(data) && typeof data === 'object') {
        exportCsv(data)
      }
    }

    async function onClick(item) {
      menu.value = false
      loading.value = true
      let data = item ? item.data : props.data

      if (!data) {
        return
      }

      if (typeof data === 'function') {
        data = await data()
      }

      exportData(data)
      loading.value = false
    }

    const createMenuItem = (item) =>
      h(
        QItem,
        {
          clickable: true,
          onClick: () => onClick(item),
        },
        () => h(QItemSection, { class: 'text-body2' }, item.label),
      )

    const MenuItems = () => {
      const menuItems = props.menuItems

      return menuItems.map(createMenuItem)
    }

    const Menu = () =>
      h(
        QMenu,
        {
          modelValue: menu.value,
          'onUpdate:modelValue': (val) => {
            menu.value = val
          },
          anchor: 'bottom right',
          self: 'top right',
        },
        () => h(QList, {}, MenuItems),
      )

    useRender(() =>
      h(
        WBtn,
        {
          ...props,
          ...attrs,
          id: 'w-table-export-btn',
          outline: true,
          loading: loading.value,
          onClick: () => (props.menuItems ? (menu.value = true) : onClick()),
          ref: root,
        },
        {
          ...slots,
          default: () => [slots.default?.(), props.menuItems ? Menu() : null],
        },
      ),
    )

    return forwardRefs(
      {
        click: () => root.value?.$el.click(),
      },
      root,
    )
  },
})

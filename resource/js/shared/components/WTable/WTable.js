import { computed, defineComponent, h, onMounted, ref } from 'vue'
import { QCheckbox, QIcon, QInput, QPagination, QSpace, QTable } from 'quasar'
import WSelect from '../select/WSelect'
import { useRender } from '@shared/composables/render'
import { forwardRefs } from '@shared/composables/forwardRef'
import { useVModel } from '@vueuse/core'
import './w-table.scss'

export default defineComponent({
  name: 'WTable',
  inheritAttrs: false,
  props: {
    rows: {
      type: Array,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    color: {
      type: String,
      default: 'primary',
    },
    grid: {
      type: Boolean,
      default: false,
    },
    hidePagination: {
      type: Boolean,
      default: false,
    },
    rowsPerPageOptions: {
      type: Array,
      default: undefined,
    },
    columns: {
      type: Array,
      default: undefined,
    },
    noFlat: {
      type: Boolean,
      default: false,
    },
    noBorder: {
      type: Boolean,
      default: false,
    },
    maxPages: {
      type: Number,
      default: 5,
    },

    hideSearch: {
      type: Boolean,
      default: false,
    },
    hideTop: {
      type: Boolean,
      default: false,
    },
    pagination: {
      type: Object,
      default: () => ({
        page: 1,
        rowsPerPage: 10,
      }),
    },
    dataKey: {
      type: String,
      default: undefined,
    },
    noDataKey: {
      type: String,
      default: undefined,
    },
    emptyStateBgColor: {
      type: String,
      default: undefined,
    },
    emptyStateTextColor: {
      type: String,
      default: undefined,
    },
    infoGuideClass: {
      type: String,
      default: undefined,
    },
    hideHeader: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { slots, attrs, emit }) {
    const tableRef = ref()
    const tableProps = computed(() => ({ ...props, ...attrs, rows: props.rows || [] }))
    const filter = ref('')

    const pagination = useVModel(props, 'pagination', emit, {
      passive: true,
    })

    const clientSide = computed(() => !pagination.value.rowsNumber)

    const currentStartIndex = computed(
      () => pagination.value.page * pagination.value.rowsPerPage - pagination.value.rowsPerPage + 1,
    )

    const currentEndIndex = computed(() => {
      const endIndex = pagination.value.page * pagination.value.rowsPerPage

      return Math.min(endIndex, total.value)
    })

    const total = computed(
      () =>
        pagination.value.rowsNumber ??
        tableRef.value?.computedRowsNumber ??
        tableProps.value.rows.length,
    )

    const max = computed(() => Math.ceil(total.value / pagination.value.rowsPerPage))

    const defaultRowsPerPageOptions = [5, 10, 15, 25, 50]

    const computedRowsPerPageOptions = computed(() => {
      return (
        tableProps.value.rowsPerPageOptions || [
          ...defaultRowsPerPageOptions,
          { name: 'All', id: total.value },
        ]
      )
    })

    const updatePagination = (updates) => {
      pagination.value = { ...pagination.value, ...updates }
      tableRef.value?.setPagination(pagination.value, true)
    }

    onMounted(() => {
      if (tableProps.value.hidePagination) {
        tableRef.value?.setPagination({ ...pagination.value, rowsPerPage: total.value }, false)
      }
    })

    const SelectionCheckbox = (scope) => {
      return h(QCheckbox, {
        modelValue: scope.selected,
        'onUpdate:modelValue': (val) => (scope.selected = val),
        size: 'sm',
      })
    }

    const RowsPerPageSelect = () => {
      return h(WSelect, {
        modelValue: pagination.value.rowsPerPage,
        disable: tableProps.value.loading,
        loading: tableProps.value.loading,
        options: computedRowsPerPageOptions.value,
        class: 'q-ml-md',
        emitValue: true,
        hideBottomSpace: true,
        mapOptions: true,
        optionLabel: 'name',
        optionValue: 'id',
        'onUpdate:modelValue': (val) => updatePagination({ rowsPerPage: val }),
      })
    }

    const PaginationControls = () => {
      return h(QPagination, {
        modelValue: pagination.value.page,
        disable: tableProps.value.loading,
        max: max.value,
        maxPages: tableProps.value.maxPages,
        directionLinks: true,
        'onUpdate:modelValue': (val) => updatePagination({ page: val }),
      })
    }

    const PaginationSection = ({ hideRowsPerPage = false }) => {
      return h(
        'div',
        {
          class: { 'justify-end': hideRowsPerPage, 'row items-center justify-between': true },
        },
        [
          !hideRowsPerPage &&
            h('div', { class: 'row no-wrap items-center text-body2' }, [RowsPerPageSelect()]),
          PaginationControls(),
        ],
      )
    }

    const CountSection = () => {
      return h('div', { class: 'text-body2' }, [
        `Showing ${currentStartIndex.value} to ${currentEndIndex.value} of ${total.value} entries`,
      ])
    }

    const SearchInput = () => {
      if (!clientSide.value || tableProps.value.hideSearch) return null

      return h(
        QInput,
        {
          modelValue: filter.value,
          'onUpdate:modelValue': (val) => (filter.value = val),
          disable: tableProps.value.loading,
          debounce: '300',
          dense: true,
          outlined: true,
          placeholder: 'Search',
        },
        {
          append: () => h(QIcon, { name: 'sym_r_search' }),
        },
      )
    }

    const TopSection = () => {
      return h(
        'div',
        { class: 'text-grey-8 column gap-2 justify-start', style: 'inline-size: 100%' },
        [
          slots['prepend-top']?.(),
          h('div', { class: 'row items-center text-body2 gap-2' }, [
            slots['top-left']?.() ?? [
              slots['prepend-search']?.(),
              SearchInput(),
              slots['append-search']?.(),
            ],
            h(QSpace),
            slots['top-right']?.() ?? [slots['prepend-export']?.(), slots['append-export']?.()],
          ]),
          slots['append-top']?.(),
        ],
      )
    }

    useRender(() =>
      h(
        QTable,
        {
          ref: tableRef,
          ...tableProps.value,
          pagination: pagination.value,
          'onUpdate:pagination': (val) => (pagination.value = val),
          bordered: !props.noBorder,
          filter: filter.value,
          flat: !tableProps.value.noFlat,
          binaryStateSort: true,
          class: [
            'app-table',
            !tableProps.value.rows || tableProps.value.rows.length === 0 ? 'no-data-border' : '',
          ],
          hidePagination: true,
          // Hide headers if dataKey is present and no rows
          hideHeader:
            tableProps.value.hideHeader ||
            !!(
              tableProps.value.dataKey &&
              (!tableProps.value.rows || tableProps.value.rows.length === 0)
            ),
        },
        {
          'header-selection': !tableProps.value.grid
            ? (scope) => SelectionCheckbox(scope)
            : undefined,
          'body-selection': !tableProps.value.grid
            ? (scope) => SelectionCheckbox(scope)
            : undefined,
          'no-data': ({ message }) =>
            h(
              'div',
              {
                class: 'full-width row flex-center q-gutter-sm',
              },
              message,
            ),
          top:
            tableProps.value.hideTop ||
            (tableProps.value.dataKey &&
              (!tableProps.value.rows || tableProps.value.rows.length === 0))
              ? undefined
              : TopSection,
          bottom: !tableProps.value.hidePagination
            ? () =>
                h(
                  'div',
                  {
                    class: 'text-grey-8',
                    style: 'inline-size: 100%',
                  },
                  [h('div', { class: 'q-my-md' }, [PaginationSection({})]), CountSection()],
                )
            : undefined,
          ...slots,
        },
      ),
    )

    return forwardRefs({}, tableRef)
  },
})

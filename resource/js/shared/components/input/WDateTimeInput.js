import { DateTime } from 'luxon'
import { QDate, QIcon, QPopupProxy } from 'quasar'
import { computed, defineComponent, h, ref } from 'vue'
import { useRender } from '@shared/composables/render'
import { forwardRefs } from '@shared/composables/forwardRef'
import WField from './WField'
import WTimeSelect from './WTimeSelect.vue'

const QDATE_MASK = 'YYYY/MM/DD'

export const WDateTimeInput = defineComponent({
  name: 'WDateTimeInput',
  inheritAttrs: false,

  props: {
    modelValue: {
      type: DateTime,
      default: null,
    },
    mode: {
      type: String,
      default: 'datetime',
      validator: (v) => ['datetime', 'date'].includes(v),
    },
  },

  emits: ['update:modelValue'],

  setup(props, { attrs, slots, emit }) {
    const rootRef = ref()
    const dateRef = ref()

    const isDatetimeMode = computed(() => props.mode === 'datetime')

    const dateString = computed(() => {
      const dt = props.modelValue
      if (!dt || !dt.isValid) return null
      return dt.toFormat('yyyy/MM/dd')
    })

    const timeMinutes = computed(() => {
      const dt = props.modelValue
      if (!dt || !dt.isValid) return 0
      return dt.hour * 60 + Math.floor(dt.minute / 5) * 5
    })

    const text = computed(() => {
      const dt = props.modelValue
      if (!dt || !dt.isValid) return ''
      if (props.mode === 'date') return dt.toLocaleString(DateTime.DATE_MED)
      return dt.toLocaleString(DateTime.DATETIME_MED)
    })

    const open = ref(false)

    const pickerProps = computed(() => {
      const { modelValue: _m, class: _c, style: _s, mode: _mode, ...rest } = { ...props, ...attrs }
      return rest
    })

    function handleDateUpdate(val) {
      if (!val) return
      const parts = val.split('/')
      const year = parseInt(parts[0])
      const month = parseInt(parts[1])
      const day = parseInt(parts[2])

      // when handling date update, we want to preserve the time part if possible
      // but if the current modelValue is invalid, we start from the beginning of the day
      const current =
        props.modelValue && props.modelValue.isValid
          ? props.modelValue
          : DateTime.now().set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
      const updated = current.set({ year, month, day })
      emit('update:modelValue', updated)

      if (!isDatetimeMode.value) open.value = false
    }

    function handleTimeUpdate(val) {
      // when handling time update, we want to preserve the date part if possible
      // here no need to start from the beginning of the day because we will override the time part anyway
      const current =
        props.modelValue && props.modelValue.isValid ? props.modelValue : DateTime.now()
      const hour = Math.floor(val / 60)
      const minute = val % 60
      emit('update:modelValue', current.set({ hour, minute, second: 0, millisecond: 0 }))
    }

    function handleKeyDown(e) {
      if (e.key === 'Escape') open.value = false
      if (e.key === 'Enter' && !open.value) open.value = true
    }

    function handleUpdatePopup(val) {
      open.value = val
    }

    function DatePopupContent() {
      return h('div', [
        h(QDate, {
          ref: dateRef,
          mask: QDATE_MASK,
          modelValue: dateString.value,
          'onUpdate:modelValue': handleDateUpdate,
        }),
      ])
    }

    function DateField() {
      return h(
        WField,
        {
          ref: rootRef,
          ...pickerProps.value,
          class: ['cursor-pointer', isDatetimeMode.value ? 'tw:flex-1' : '', attrs.class],
          style: attrs.style,
          modelValue: dateString.value,
          onKeydown: handleKeyDown,
          tabindex: 0,
          role: 'combobox',
          'aria-haspopup': 'dialog',
          'aria-expanded': open.value,
        },
        {
          ...slots,
          default: () =>
            h(
              QPopupProxy,
              { modelValue: open.value, 'onUpdate:modelValue': handleUpdatePopup },
              DatePopupContent,
            ),
          control: () => h('div', { class: 'self-center full-width no-outline' }, text.value),
          append:
            slots.append ??
            (() =>
              h(QIcon, {
                name: 'sym_r_calendar_today',
                role: 'presentation',
              })),
        },
      )
    }

    useRender(() => {
      if (!isDatetimeMode.value) return DateField()

      return h('div', { class: 'tw:flex tw:flex-row tw:items-start tw:gap-2' }, [
        DateField(),
        h(WTimeSelect, {
          modelValue: timeMinutes.value,
          'onUpdate:modelValue': handleTimeUpdate,
        }),
      ])
    })

    return forwardRefs(
      {
        open: () => {
          open.value = true
        },
        close: () => {
          open.value = false
        },
        toggle: () => {
          open.value = !open.value
        },
      },
      rootRef,
      dateRef,
    )
  },
})

export default WDateTimeInput

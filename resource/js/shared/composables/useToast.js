/**
 * useToast — App-global toast notification system.
 *
 * Uses a module-level reactive queue so toasts work everywhere,
 * including outside component setup (e.g. in main.js handlers).
 *
 * @example
 *   const toast = useToast()
 *   toast.notify({ type: 'positive', message: 'Saved!' })
 *   toast.notify({ type: 'negative', message: 'Failed', timeout: 5000 })
 */

import { ValidationError } from '@syncEngine/index'
import { ref } from 'vue'

/** @type {import('vue').Ref<Array<ToastItem>>} */
const toasts = ref([])

let nextId = 0
const timers = new Map()

/**
 * @typedef {Object} ToastOptions
 * @property {'positive'|'negative'|'warning'|'info'} type
 * @property {string} message
 * @property {string} [caption]
 * @property {'top'|'top-right'|'top-left'|'bottom'|'bottom-right'|'bottom-left'|'center'} [position='top']
 * @property {number} [timeout=3000]  0 = no auto-dismiss
 * @property {boolean} [html=false]
 * @property {boolean} [multiLine=false]
 */

/**
 * @typedef {ToastOptions & { id: number }} ToastItem
 */

/**
 * Add a toast to the queue.
 * @param {ToastOptions} options
 * @returns {number} toast id (for programmatic dismiss)
 */
function notify(options) {
  const id = nextId++
  const toast = {
    id,
    type: options.type || 'info',
    message: options.message || '',
    caption: options.caption || '',
    position: options.position || 'top',
    timeout: options.timeout ?? 3000,
    html: options.html || false,
    multiLine: options.multiLine || false,
  }

  toasts.value = [...toasts.value, toast]

  if (toast.timeout > 0) {
    const timer = setTimeout(() => {
      dismiss(id)
    }, toast.timeout)
    timers.set(id, timer)
  }

  return id
}

/**
 * Dismiss a specific toast by id.
 * @param {number} id
 */
function dismiss(id) {
  const timer = timers.get(id)
  if (timer) {
    clearTimeout(timer)
    timers.delete(id)
  }
  toasts.value = toasts.value.filter((t) => t.id !== id)
}

function success(message, options = {}) {
  return notify({ ...options, type: 'positive', message })
}

function error(message, options = {}) {
  if (message instanceof ValidationError) {
    message = message.errors.map((err) => `${err.field}: ${err.message}`).join('\n')
  } else if (message instanceof Error) {
    message = message.message
  }

  return notify({ ...options, type: 'negative', message })
}

function warning(message, options = {}) {
  return notify({ ...options, type: 'warning', message })
}

/**
 * Dismiss all active toasts.
 */
function dismissAll() {
  for (const timer of timers.values()) {
    clearTimeout(timer)
  }
  timers.clear()
  toasts.value = []
}

export function useToast() {
  return { toasts, notify, dismiss, dismissAll, success, error, warning }
}

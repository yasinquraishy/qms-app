/**
 * pendingRequests — tracks the number of in-flight API saves and blocks the
 * browser's tab/window close while any are outstanding.
 *
 * Usage:
 *   pendingRequests.increment()
 *   try { ... } finally { pendingRequests.decrement() }
 */

let count = 0

function onBeforeUnload(event) {
  event.preventDefault()
  // Chrome requires returnValue to be set
  event.returnValue = 'Wait for pending changes to sync before leaving the page.'
}

export const pendingRequests = {
  increment() {
    count++
    if (count === 1) {
      window.addEventListener('beforeunload', onBeforeUnload)
    }
  },

  decrement() {
    if (count > 0) count--
    if (count === 0) {
      window.removeEventListener('beforeunload', onBeforeUnload)
    }
  },

  get count() {
    return count
  },
}

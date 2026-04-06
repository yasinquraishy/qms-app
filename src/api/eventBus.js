/**
 * Lightweight framework-agnostic event emitter.
 *
 * Used internally by the API layer to decouple side-effects (notifications,
 * loader state, auth events) from any UI framework.  Components or plugins
 * subscribe to events — the API layer only emits them.
 *
 * @example
 *   import { eventBus } from '@/api'
 *
 *   // Subscribe
 *   const off = eventBus.on('notify', (payload) => showToast(payload))
 *
 *   // Unsubscribe
 *   off()
 *
 * Events emitted by the API layer:
 *   - 'notify'          { type, message, errors? }
 *   - 'loader:start'    { key }
 *   - 'loader:stop'     { key }
 *   - 'auth:unauthorized'  {}
 *   - 'auth:forbidden'     { message }
 *   - 'auth:session-expired' {}
 */

const listeners = new Map()

/**
 * Subscribe to an event.
 * @param {string} event
 * @param {Function} callback
 * @returns {Function} unsubscribe function
 */
function on(event, callback) {
  if (!listeners.has(event)) {
    listeners.set(event, new Set())
  }
  listeners.get(event).add(callback)

  // Return unsubscribe function
  return () => listeners.get(event)?.delete(callback)
}

/**
 * Subscribe to an event, but auto-unsubscribe after the first invocation.
 * @param {string} event
 * @param {Function} callback
 * @returns {Function} unsubscribe function
 */
function once(event, callback) {
  const off = on(event, (...args) => {
    off()
    callback(...args)
  })
  return off
}

/**
 * Emit an event to all subscribers.
 * @param {string} event
 * @param {*} payload
 */
function emit(event, payload) {
  const callbacks = listeners.get(event)
  if (!callbacks) return
  for (const cb of callbacks) {
    try {
      cb(payload)
    } catch (err) {
      console.error(`[eventBus] Error in "${event}" listener:`, err)
    }
  }
}

/**
 * Remove all listeners (useful for testing or teardown).
 */
function clear() {
  listeners.clear()
}

export const eventBus = { on, once, emit, clear }

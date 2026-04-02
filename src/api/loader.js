/**
 * Loader state manager — tracks in-flight requests without a store.
 *
 * Strategy: callback-based.  Each `request()` call can pass a `loader` option
 * which is either:
 *   - `true`          → uses the global loader key ('global')
 *   - a string key    → scoped loader (e.g. 'fetchUsers', 'saveDocument')
 *   - a ref (Vue)     → directly sets the ref to true/false
 *   - absent / false  → no loader tracking
 *
 * Components can query loader state:
 *   import { loader } from '@/api'
 *   loader.isLoading('global')        // boolean
 *   loader.isLoading('fetchUsers')    // boolean
 *   loader.isAnyLoading()             // boolean
 *
 * Or subscribe to changes:
 *   loader.onChange((activeKeys) => { ... })
 *
 * This is intentionally framework-agnostic.  A thin Vue composable
 * (`useApiLoader`) can wrap it for reactive integration.
 */

import { eventBus } from './eventBus.js'

/**
 * Map of loader key → count of in-flight requests.
 * Using a count (not boolean) to handle concurrent requests with the same key.
 * @type {Map<string, number>}
 */
const active = new Map()

/** @type {Set<Function>} */
const changeListeners = new Set()

function emitChange() {
  const keys = [...active.entries()].filter(([, v]) => v > 0).map(([k]) => k)
  for (const cb of changeListeners) {
    try {
      cb(keys)
    } catch (err) {
      console.error('[loader] onChange listener error:', err)
    }
  }
}

/**
 * Mark a loader key as active (increment count).
 * @param {string} key
 */
function start(key = 'global') {
  active.set(key, (active.get(key) || 0) + 1)
  eventBus.emit('loader:start', { key })
  emitChange()
}

/**
 * Mark a loader key as inactive (decrement count, min 0).
 * @param {string} key
 */
function stop(key = 'global') {
  const current = active.get(key) || 0
  const next = Math.max(0, current - 1)
  if (next === 0) {
    active.delete(key)
  } else {
    active.set(key, next)
  }
  eventBus.emit('loader:stop', { key })
  emitChange()
}

/**
 * Check if a specific key has active requests.
 * @param {string} key
 * @returns {boolean}
 */
function isLoading(key = 'global') {
  return (active.get(key) || 0) > 0
}

/**
 * Check if ANY loader is active.
 * @returns {boolean}
 */
function isAnyLoading() {
  return active.size > 0
}

/**
 * Get all active loader keys.
 * @returns {string[]}
 */
function activeKeys() {
  return [...active.entries()].filter(([, v]) => v > 0).map(([k]) => k)
}

/**
 * Subscribe to loader state changes.
 * @param {(activeKeys: string[]) => void} fn
 * @returns {Function} unsubscribe
 */
function onChange(fn) {
  changeListeners.add(fn)
  return () => changeListeners.delete(fn)
}

/**
 * Reset all loaders (useful for testing).
 */
function reset() {
  active.clear()
  emitChange()
}

export const loader = {
  start,
  stop,
  isLoading,
  isAnyLoading,
  activeKeys,
  onChange,
  reset,
}

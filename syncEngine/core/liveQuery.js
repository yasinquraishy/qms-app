import { shallowRef, watch, onScopeDispose } from 'vue'
import { syncBus } from './syncBus.js'

const DEFAULT_DEBOUNCE = 50

/**
 * useLiveQuery — run an async query and re-execute on sync events.
 *
 * Returns a shallowRef so BaseModel instances are never wrapped in a Proxy
 * (avoids private-field access errors).
 *
 * @param {() => Promise<any>} queryFn — async function returning results
 * @param {object}  [options]
 * @param {string|string[]} [options.models='*']  — model(s) to watch
 * @param {any}             [options.initial=[]]  — value before first load
 * @param {number}          [options.debounce=50] — ms to coalesce burst syncs
 * @returns {{ data: import('vue').ShallowRef, loading: import('vue').ShallowRef<boolean>, refresh: () => Promise<void> }}
 */
export function useLiveQuery(
  queryFn,
  { models = '*', initial = [], debounce = DEFAULT_DEBOUNCE } = {},
) {
  const data = shallowRef(initial)
  const loading = shallowRef(false)

  async function refresh() {
    loading.value = true
    try {
      data.value = await queryFn()
    } finally {
      loading.value = false
    }
  }

  // Initial load
  refresh()

  // Subscribe to sync events (model-scoped, debounced)
  const modelList = Array.isArray(models) ? models : [models]
  const unsubscribes = modelList.map((m) => syncBus.on(m, refresh, { debounce }))

  onScopeDispose(() => unsubscribes.forEach((fn) => fn()))

  return { data, loading, refresh }
}

/**
 * useLiveQueryWithDeps — like useLiveQuery but also re-runs when reactive deps change.
 *
 * Uses Vue `watch` for dependency tracking so the query re-runs on both
 * reactive state changes AND sync events.
 *
 * @param {import('vue').WatchSource|import('vue').WatchSource[]} deps — reactive dependencies
 * @param {() => Promise<any>} queryFn
 * @param {object} [options] — same as useLiveQuery
 * @returns {{ data: import('vue').ShallowRef, loading: import('vue').ShallowRef<boolean>, refresh: () => Promise<void> }}
 */
export function useLiveQueryWithDeps(
  deps,
  queryFn,
  { models = '*', initial = [], debounce = DEFAULT_DEBOUNCE } = {},
) {
  const data = shallowRef(initial)
  const loading = shallowRef(false)

  async function refresh() {
    loading.value = true
    try {
      data.value = await queryFn()
    } finally {
      loading.value = false
    }
  }

  // Re-run when deps change (immediate: true handles the initial load)
  watch(deps, refresh, { immediate: true })

  // Re-run on sync events
  const modelList = Array.isArray(models) ? models : [models]
  const unsubscribes = modelList.map((m) => syncBus.on(m, refresh, { debounce }))

  onScopeDispose(() => unsubscribes.forEach((fn) => fn()))

  return { data, loading, refresh }
}

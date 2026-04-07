import { shallowRef, watch, onScopeDispose } from 'vue'
import { syncBus } from '@syncEngine/core/syncBus.js'
import { db } from '@models/index'

const DEFAULT_DEBOUNCE = 50

/**
 * useLiveQuery — run an async query and re-execute on sync events.
 *
 * Returns a shallowRef so BaseModel instances are never wrapped in a Proxy
 * (avoids private-field access errors).
 *
 * @template T
 * @param {(db: typeof import('@models/index').db) => Promise<T>} queryFn — async function returning results
 * @param {object}  [options]
 * @param {string|string[]} [options.models='*']  — model(s) to watch
 * @param {any}             [options.initial=undefined]  — value before first load
 * @param {number}          [options.debounce=50] — ms to coalesce burst syncs
 * @returns {import('vue').ShallowRef<T>}
 */
export function useLiveQuery(
  queryFn,
  { models = '*', initial = undefined, debounce = DEFAULT_DEBOUNCE } = {},
) {
  const data = shallowRef(initial)

  async function refresh() {
    try {
      data.value = await queryFn(db)
    } catch (err) {
      console.error(err)
    }
  }

  // Initial load
  refresh()

  // Subscribe to sync events (model-scoped, debounced)
  const modelList = Array.isArray(models) ? models : [models]
  const unsubscribes = modelList.map((m) => syncBus.on(m, refresh, { debounce }))

  onScopeDispose(() => unsubscribes.forEach((fn) => fn()))

  return data
}

/**
 * useLiveQueryWithDeps — like useLiveQuery but also re-runs when reactive deps change.
 *
 * Uses Vue `watch` for dependency tracking so the query re-runs on both
 * reactive state changes AND sync events.
 *
 * @template T
 * @param {import('vue').WatchSource|import('vue').WatchSource[]} deps — reactive dependencies
 * @param {(db: typeof import('@models/index').db, ...args: any[]) => Promise<T>} queryFn
 * @param {object} [options] — same as useLiveQuery
 * @returns {import('vue').ShallowRef<T>}
 */
export function useLiveQueryWithDeps(
  deps,
  queryFn,
  { models = '*', initial = undefined, debounce = DEFAULT_DEBOUNCE } = {},
) {
  const data = shallowRef(initial)
  let lastDepValues = []

  async function refresh(depValues) {
    try {
      data.value = await queryFn(db, depValues)
    } catch (err) {
      console.error(err)
    }
  }

  // Re-run when deps change (immediate: true handles the initial load)
  watch(
    deps,
    (newValues) => {
      lastDepValues = newValues
      refresh(newValues)
    },
    { immediate: true },
  )

  // Re-run on sync events — reuse the last resolved dep values
  const modelList = Array.isArray(models) ? models : [models]
  const unsubscribes = modelList.map((m) =>
    syncBus.on(m, () => refresh(lastDepValues), { debounce }),
  )

  onScopeDispose(() => unsubscribes.forEach((fn) => fn()))

  return data
}

/**
 * @template T
 * @param {(db: typeof import('@models/index').db, ...args: any[]) => Promise<T>} mutationFn
 * @returns {(args: any[]) => Promise<T>} mutate function that runs the mutation and logs errors
 */
export function useLiveMutation(mutationFn) {
  async function mutate(...args) {
    try {
      return await mutationFn(db, ...args)
    } catch (err) {
      console.error(err)
    }
  }

  return mutate
}

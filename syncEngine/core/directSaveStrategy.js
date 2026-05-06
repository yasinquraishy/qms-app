/**
 * directSaveStrategy — the save strategy used by BaseModel when the syncEngine
 * is running in main-thread direct-API mode.
 *
 * Pessimistic flow:
 *   1. Fire GraphQL mutation via MutationRunner.
 *   2. On success: write server record to IDB, update ObjectPool, emit syncBus.
 *   3. On failure: throw — no IDB mutation, no rollback needed.
 *
 * Coalescing: per-instance backpressure with at most 1 in-flight + 1 pending
 * save. Additional save() calls while a save is pending share the pending
 * promise; when the in-flight save settles, the pending slot becomes the next
 * in-flight save and re-reads instance state at run time, so 5 rapid edits
 * collapse into 2 HTTP requests.
 */

import { OPERATION, LOAD_STRATEGY } from '../shared/constants.js'
import ModelRegistry from './ModelRegistry.js'
import { MutationRunner } from '../network/MutationRunner.js'
import { IndexedDB } from '../persistence/IndexedDB.js'
import { dehydrate, serializeValue, valuesEqual } from '../persistence/hydration.js'
import { ObjectPool } from './ObjectPool.js'
import { syncBus } from './syncBus.js'
import { markAsRecentlyWritten } from '../sync/socketSubscriber.js'
import { pendingRequests } from './pendingRequests.js'

/**
 * Detach a value from the live model so subsequent in-place mutations on
 * arrays/objects don't bleed into the snapshot. JSON-based clone is sufficient
 * for our use case (comparing structural equality against the live value
 * after the API returns); DateTime instances serialize via their toJSON.
 */
function snapshotValue(value) {
  if (value === null || typeof value !== 'object') return value
  try {
    return JSON.parse(JSON.stringify(value))
  } catch {
    return value
  }
}

/**
 * Compare a snapshot taken with snapshotValue() against a live instance value.
 * Falls back to JSON-stringified comparison for arrays/objects where reference
 * equality (valuesEqual) is meaningless after deep cloning.
 */
function snapshotEqual(snapshot, current) {
  if (valuesEqual(snapshot, current)) return true
  if (
    snapshot === null ||
    current === null ||
    typeof snapshot !== 'object' ||
    typeof current !== 'object'
  ) {
    return false
  }
  try {
    return JSON.stringify(snapshot) === JSON.stringify(current)
  } catch {
    return false
  }
}

/**
 * Per-instance save state — keyed by "ModelName:pk".
 * @typedef {object} SaveState
 * @property {Promise<void>|null} inFlight        - The currently running save, or null.
 * @property {Promise<void>|null} pendingPromise  - Shared promise for any pending save, or null.
 * @property {((value: void) => void)|null} pendingResolve
 * @property {((reason: unknown) => void)|null} pendingReject
 *
 * @type {Map<string, SaveState>}
 */
const saveStates = new Map()

/**
 * @param {import('./BaseModel.js').BaseModel} instance
 */
export async function directSaveStrategy(instance) {
  const modelName = instance.constructor.name
  const schema = ModelRegistry.getSchema(modelName)
  if (!schema) throw new Error(`[directSaveStrategy] Unknown model: ${modelName}`)

  const pk = schema.primaryKey
  const id = instance[pk]
  const tableName = schema.tableName

  // LOCAL strategy: just write to IDB (no network), no queueing needed.
  if (schema.loadStrategy === LOAD_STRATEGY.LOCAL) {
    await dehydrate(modelName, instance)
    instance._clearModified()
    syncBus.emit({ modelName, modelId: id, action: instance.action, type: 'transactionCommitted' })
    return
  }

  const queueKey = `${modelName}:${id}`
  let state = saveStates.get(queueKey)
  if (!state) {
    state = { inFlight: null, pendingPromise: null, pendingResolve: null, pendingReject: null }
    saveStates.set(queueKey, state)
  }

  // Nothing in flight: start immediately.
  if (!state.inFlight) {
    return runSave(instance, schema, pk, id, tableName, state, queueKey)
  }

  // In-flight exists: reuse / create a single pending slot. All callers that
  // arrive while this slot is open share the same pending promise — the next
  // runSave invocation (after the in-flight settles) will re-read instance
  // state, so multiple coalesced callers all reflect the latest edits.
  if (!state.pendingPromise) {
    state.pendingPromise = new Promise((resolve, reject) => {
      state.pendingResolve = resolve
      state.pendingReject = reject
    })
  }
  return state.pendingPromise
}

/**
 * Kick off a single save and arrange the pending slot to be picked up next.
 * Errors are not propagated to the pending caller — the pending save runs
 * regardless and the new caller awaits its own outcome.
 */
function runSave(instance, schema, pk, id, tableName, state, queueKey) {
  const promise = _executeSave(instance, schema, pk, id, tableName)
  state.inFlight = promise
  promise.finally(() => {
    state.inFlight = null
    if (state.pendingPromise) {
      const pendingResolve = state.pendingResolve
      const pendingReject = state.pendingReject
      state.pendingPromise = null
      state.pendingResolve = null
      state.pendingReject = null
      runSave(instance, schema, pk, id, tableName, state, queueKey).then(
        pendingResolve,
        pendingReject,
      )
    } else {
      saveStates.delete(queueKey)
    }
  })
  return promise
}

/**
 * Core save logic — runs serially per instance via runSave().
 * Reads instance state at call time so it naturally coalesces rapid edits.
 */
async function _executeSave(instance, schema, pk, id, tableName) {
  const modelName = instance.constructor.name
  // Re-read action at run time — a delete may have been queued after an update.
  const action = instance.action

  // Re-check dirtiness at run time: the previous save may already have
  // committed all pending changes, making this one a no-op.
  if (!instance.isDirty() && action === OPERATION.UPDATE) return

  // Snapshot the dirty field NAMES before the async request.
  // After the request we use this to:
  //   (a) clear only the fields we actually sent from #modified, and
  //   (b) detect which fields the user edited while the request was in flight.
  const dirtyKeysAtSendTime = new Set(instance.getModifiedProperties())

  // Snapshot the VALUES we are about to send so we can compare afterwards
  // and re-mark any field the user changed mid-flight as dirty again.
  // Deep-clone Array/Object fields — otherwise the snapshot would share its
  // reference with the live instance and an in-place mutation (e.g. push to
  // an `options` array) would be invisible to the post-flight comparison.
  const preMutationValues = {}
  for (const key of dirtyKeysAtSendTime) {
    preMutationValues[key] = snapshotValue(instance[key])
  }

  // Mark as pending BEFORE the network request so socket echo events arriving
  // before the HTTP response are suppressed rather than triggering a fetchOne.
  markAsRecentlyWritten(modelName, id)

  pendingRequests.increment()
  let serverRecord
  try {
    serverRecord = await MutationRunner.run(instance, action)
  } finally {
    pendingRequests.decrement()
  }

  if (action === OPERATION.DELETE) {
    await IndexedDB.delete(tableName, id)
    ObjectPool.unregister(modelName, id)
    instance._clearModified()
  } else {
    if (serverRecord) {
      // Build the record to persist in IDB.
      // For fields the user edited while the request was in flight, keep their
      // current value so a subsequent hydration won't revert their work.
      const currentDirtyKeys = instance.getModifiedProperties()
      let recordToWrite = serverRecord
      if (currentDirtyKeys.length > 0) {
        recordToWrite = { ...serverRecord }
        for (const key of currentDirtyKeys) {
          const propMeta = schema.properties?.get(key)
          recordToWrite[key] = serializeValue(instance[key], propMeta)
        }
      }
      await IndexedDB.put(tableName, recordToWrite)
      // Refresh the echo-suppression window now that we have the server ack.
      markAsRecentlyWritten(modelName, id)

      // Partial dirty-state reconciliation:
      // Clear only the fields we sent (others may have been edited mid-flight).
      instance._clearModifiedFields(dirtyKeysAtSendTime)
      // Re-mark any sent field whose value the user changed while we waited,
      // so the next queued save will include those edits.
      for (const key of dirtyKeysAtSendTime) {
        if (!snapshotEqual(preMutationValues[key], instance[key])) {
          instance._propertyChanged(key)
        }
      }
    } else {
      // Fallback: no server record returned — persist local state.
      await dehydrate(modelName, instance)
      instance._clearModifiedFields(dirtyKeysAtSendTime)
    }
  }

  syncBus.emit({ modelName, modelId: id, action, type: 'transactionCommitted' })
}

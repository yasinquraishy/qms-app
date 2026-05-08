/**
 * directSaveStrategy — pessimistic save: API first, then IDB.
 *
 * Flow:
 *   1. For UPDATE: read the latest IDB row, diff against the in-memory
 *      instance, build a patch. If patch is empty, return without firing
 *      a network request.
 *   2. Fire the GraphQL mutation via MutationRunner.
 *   3. On success: write the server response to IDB, hydrate the pooled
 *      instance from that record, emit syncBus.
 *   4. On failure: throw — IDB is untouched, no rollback needed.
 *
 * Coalescing: per-instance backpressure with at most 1 in-flight + 1 pending
 * save. Additional save() calls while a save is pending share the pending
 * promise; when the in-flight save settles, the pending slot becomes the next
 * in-flight save and re-reads instance state at run time, so 5 rapid edits
 * collapse into 2 HTTP requests.
 *
 * Echo suppression: `markAsRecentlyWritten` is fired before and after the
 * mutation so the socket event for our own write doesn't trigger a redundant
 * fetch + IDB.put. Server is authoritative; the result is identical either
 * way, but skipping the redundant work avoids extra GraphQL traffic and
 * spurious live-query refires.
 */

import { OPERATION, LOAD_STRATEGY } from '../shared/constants.js'
import ModelRegistry from './ModelRegistry.js'
import { MutationRunner } from '../network/MutationRunner.js'
import { IndexedDB } from '../persistence/IndexedDB.js'
import { computeUpdatePatch, dehydrate, hydrate } from '../persistence/hydration.js'
import { ObjectPool } from './ObjectPool.js'
import { syncBus } from './syncBus.js'
import { markAsRecentlyWritten } from '../sync/socketSubscriber.js'
import { pendingRequests } from './pendingRequests.js'

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
    syncBus.emit({ modelName, modelId: id, action: instance.action, type: 'transactionCommitted' })
    return
  }

  const queueKey = `${modelName}:${id}`
  let state = saveStates.get(queueKey)
  if (!state) {
    state = { inFlight: null, pendingPromise: null, pendingResolve: null, pendingReject: null }
    saveStates.set(queueKey, state)
  }

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

  // For UPDATE: compute the patch by diffing the in-memory instance against
  // the latest persisted IDB row. If nothing changed (e.g. a debounced save
  // fired but the user reverted, or a previous save already committed all
  // pending edits), return without a network round trip.
  let patch = null
  if (action === OPERATION.UPDATE) {
    const previousRecord = await IndexedDB.get(tableName, id)
    patch = computeUpdatePatch(modelName, instance, previousRecord)
    if (Object.keys(patch).length === 0) return
  }

  // Mark as pending BEFORE the network request so socket echo events arriving
  // before the HTTP response are suppressed rather than triggering a fetchOne.
  markAsRecentlyWritten(modelName, id)

  pendingRequests.increment()
  let serverRecord
  try {
    serverRecord = await MutationRunner.run(instance, action, { patch })
  } finally {
    pendingRequests.decrement()
  }

  if (action === OPERATION.DELETE) {
    await IndexedDB.delete(tableName, id)
    ObjectPool.unregister(modelName, id)
  } else if (serverRecord) {
    await IndexedDB.put(tableName, serverRecord)
    // Refresh the echo-suppression window now that we have the server ack.
    markAsRecentlyWritten(modelName, id)
    // Re-hydrate the pooled instance from the freshly-written server record so
    // the in-memory model reflects what the server actually persisted (which
    // may include server-set fields like updatedAt, server defaults, etc.).
    await hydrate(modelName, id, {}, serverRecord)
  } else {
    // No server record returned for a non-DELETE — the mutation succeeded but
    // the response was empty. Fall back to persisting local state.
    console.warn(
      `[directSaveStrategy] ${action} for ${modelName}:${id} returned no record; persisting local state`,
    )
    await dehydrate(modelName, instance)
  }

  syncBus.emit({ modelName, modelId: id, action, type: 'transactionCommitted' })
}

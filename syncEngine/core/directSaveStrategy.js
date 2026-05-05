/**
 * directSaveStrategy — the save strategy used by BaseModel when the syncEngine
 * is running in main-thread direct-API mode.
 *
 * Replaces SyncTransaction (which optimistically wrote to IDB and queued for the SW).
 * New flow (pessimistic):
 *   1. Fire GraphQL mutation via MutationRunner.
 *   2. On success: write server record to IDB, update ObjectPool, emit syncBus.
 *   3. On failure: throw — no IDB mutation, no rollback needed.
 */

import { OPERATION, LOAD_STRATEGY } from '../shared/constants.js'
import ModelRegistry from './ModelRegistry.js'
import { MutationRunner } from '../network/MutationRunner.js'
import { IndexedDB } from '../persistence/IndexedDB.js'
import { dehydrate, hydrate } from '../persistence/hydration.js'
import { ObjectPool } from './ObjectPool.js'
import { syncBus } from './syncBus.js'
import { markAsRecentlyWritten } from '../sync/socketSubscriber.js'

/**
 * @param {import('./BaseModel.js').BaseModel} instance
 */
export async function directSaveStrategy(instance) {
  const modelName = instance.constructor.name
  const schema = ModelRegistry.getSchema(modelName)
  if (!schema) throw new Error(`[directSaveStrategy] Unknown model: ${modelName}`)

  const pk = schema.primaryKey
  const id = instance[pk]
  const action = instance.action
  const tableName = schema.tableName

  // LOCAL strategy: just write to IDB (no network)
  if (schema.loadStrategy === LOAD_STRATEGY.LOCAL) {
    await dehydrate(modelName, instance)
    instance._clearModified()
    syncBus.emit({ modelName, modelId: id, action, type: 'transactionCommitted' })
    return
  }

  // Network sync (pessimistic — IDB is only written on API success)
  const serverRecord = await MutationRunner.run(instance, action)

  if (action === OPERATION.DELETE) {
    await IndexedDB.delete(tableName, id)
    ObjectPool.unregister(modelName, id)
    instance._clearModified()
  } else {
    if (serverRecord) {
      // Write the authoritative server record to IDB (includes server-computed fields)
      await IndexedDB.put(tableName, serverRecord)
      // Suppress the echo socket event for this write
      markAsRecentlyWritten(modelName, id)
      // Sync the in-memory instance with the server values (via ObjectPool)
      await hydrate(modelName, id, {}, serverRecord)
    } else {
      // Fallback: no server record returned — persist local state
      await dehydrate(modelName, instance)
      instance._clearModified()
    }
  }

  syncBus.emit({ modelName, modelId: id, action, type: 'transactionCommitted' })
}

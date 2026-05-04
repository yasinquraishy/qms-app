/**
 * syncMetaStore — persists per-model `lastSyncValue` (delta-sync watermark) in IDB.
 *
 * Stored in the `__syncMeta__` IDB object store (created by persistence/IndexedDB.js).
 * The store is company-scoped (lives inside the same IDB as the model data), so it
 * is automatically wiped when the DB is nuked on schema change or company switch.
 */

import { IndexedDB } from './IndexedDB.js'
import { SYNC_META_STORE } from '../shared/constants.js'

export const syncMetaStore = {
  /**
   * Read the stored lastSyncValue for a model.
   * Returns null if the model has never been synced.
   * @param {string} modelName
   * @returns {Promise<string|number|null>}
   */
  async get(modelName) {
    const record = await IndexedDB.get(SYNC_META_STORE, modelName)
    return record?.lastSyncValue ?? null
  },

  /**
   * Persist the latest sync watermark for a model.
   * @param {string} modelName
   * @param {string|number} value
   */
  async set(modelName, value) {
    await IndexedDB.put(SYNC_META_STORE, { modelName, lastSyncValue: value })
  },
}

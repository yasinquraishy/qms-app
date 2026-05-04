// IndexedDB.js
import { buildStoreDefinitions } from './schemaManager.js'
import { IndexedDB as AbstractIndexedDB } from '../shared/IndexedDB.js'
import { SYNC_META_STORE } from '../shared/constants.js'

export class IndexedDB extends AbstractIndexedDB {
  /**
   * Create all object stores at version 1.
   * @param {IDBDatabase} db
   */
  static ensureSchema(db) {
    const definitions = buildStoreDefinitions()

    for (const [storeName, def] of Object.entries(definitions)) {
      const store = db.createObjectStore(storeName, { keyPath: def.keyPath })

      for (const idx of def.indexes) {
        if (idx.type === 'single') {
          store.createIndex(idx.name, idx.field, { unique: false })
        } else if (idx.type === 'compound') {
          store.createIndex(idx.name, idx.fields, {
            unique: false,
          })
        }
      }
    }

    // Delta-sync watermark store (keyed by modelName)
    db.createObjectStore(SYNC_META_STORE, { keyPath: 'modelName' })
  }
}

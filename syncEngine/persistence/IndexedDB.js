// IndexedDB.js
import { buildStoreDefinitions } from "./schemaManager.js";
import { IndexedDB as AbstractIndexedDB } from "../shared/IndexedDB.js";

export class IndexedDB extends AbstractIndexedDB {
  /**
   * Create all object stores at version 1.
   * @param {IDBDatabase} db
   */
  static ensureSchema(db) {
    const definitions = buildStoreDefinitions();

    for (const [storeName, def] of Object.entries(definitions)) {
      const store = db.createObjectStore(storeName, { keyPath: def.keyPath });

      for (const idx of def.indexes) {
        if (idx.type === "single") {
          store.createIndex(idx.field, idx.field, { unique: false });
        } else if (idx.type === "compound") {
          store.createIndex(idx.fields.join("+"), idx.fields, {
            unique: false,
          });
        }
      }
    }
  }
}

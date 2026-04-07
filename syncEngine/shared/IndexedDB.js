// IndexedDB.js
import { TX_MODE } from './constants.js'

export class IndexedDB {
  /**
   * @type {IDBDatabase}
   */
  static #db = null

  /**
   * Initialize and open the IndexedDB database.
   * @param {string} dbName
   * @returns {Promise<IDBDatabase>}
   */
  static async init(dbName) {
    if (IndexedDB.#db) return IndexedDB.#db
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(dbName, 1)
      req.onerror = () => reject(req.error)
      req.onsuccess = () => {
        IndexedDB.#db = req.result
        resolve(IndexedDB.#db)
      }
      req.onupgradeneeded = (event) => {
        this.ensureSchema(event.target.result)
      }
    })
  }

  /**
   * Close the current database connection so init() can reopen a different DB.
   */
  static close() {
    if (IndexedDB.#db) {
      IndexedDB.#db.close()
      IndexedDB.#db = null
    }
  }

  /**
   * Persist a record to a model store.
   * @param {string} storeName
   * @param {object} record - must have `id` field
   */
  static async put(storeName, record) {
    return new Promise((resolve, reject) => {
      const tx = IndexedDB.#db.transaction(storeName, TX_MODE.READWRITE)
      const store = tx.objectStore(storeName)
      const req = store.put(record)
      req.onerror = () => reject(req.error)
      tx.oncomplete = () => resolve(record)
    })
  }

  /**
   * Retrieve a record by id from a model store.
   * @param {string} storeName
   * @param {*} id
   * @returns {Promise<object|null>}
   */
  static async get(storeName, id) {
    return new Promise((resolve, reject) => {
      const tx = IndexedDB.#db.transaction(storeName, TX_MODE.READONLY)
      const store = tx.objectStore(storeName)
      const req = store.get(id)
      req.onerror = () => reject(req.error)
      req.onsuccess = () => resolve(req.result ?? null)
    })
  }

  /**
   * Retrieve all records from a model store.
   * @param {string} storeName
   * @returns {Promise<object[]>}
   */
  static async getAll(storeName) {
    return new Promise((resolve, reject) => {
      const tx = IndexedDB.#db.transaction(storeName, TX_MODE.READONLY)
      const store = tx.objectStore(storeName)
      const req = store.getAll()
      req.onerror = () => reject(req.error)
      req.onsuccess = () => resolve(req.result ?? [])
    })
  }

  /**
   * Persist multiple records to a model store.
   * @param {string} storeName
   * @param {object[]} records - array of records, each must have `id` field
   */
  static async bulkPut(storeName, records) {
    return new Promise((resolve, reject) => {
      const tx = IndexedDB.#db.transaction(storeName, TX_MODE.READWRITE)
      const store = tx.objectStore(storeName)
      for (const record of records) {
        store.put(record)
      }
      tx.oncomplete = () => resolve(records)
      tx.onerror = () => reject(tx.error)
    })
  }

  /**
   * Delete a record by id from a model store.
   * @param {string} storeName
   * @param {*} id
   */
  static async delete(storeName, id) {
    return new Promise((resolve, reject) => {
      const tx = IndexedDB.#db.transaction(storeName, TX_MODE.READWRITE)
      const store = tx.objectStore(storeName)
      const req = store.delete(id)
      req.onerror = () => reject(req.error)
      tx.oncomplete = () => resolve()
    })
  }

  /**
   * Get all records matching a specific index value.
   * @param {string} storeName
   * @param {string} indexName
   * @param {*} value
   * @returns {Promise<object[]>}
   */
  static async getByIndex(storeName, indexName, value) {
    return new Promise((resolve, reject) => {
      const tx = IndexedDB.#db.transaction(storeName, TX_MODE.READONLY)
      const store = tx.objectStore(storeName)
      const index = store.index(indexName)
      const req = index.getAll(value)
      req.onerror = () => reject(req.error)
      req.onsuccess = () => resolve(req.result ?? [])
    })
  }

  /**
   * Cursor-based scan with per-record filter. Avoids loading the entire store into memory.
   * @param {string} storeName
   * @param {(record: object) => boolean} filterFn
   * @param {{ limit?: number|null, offset?: number }} [options]
   * @returns {Promise<object[]>}
   */
  static async scan(storeName, filterFn, { limit = null, offset = 0 } = {}) {
    return new Promise((resolve, reject) => {
      const tx = IndexedDB.#db.transaction(storeName, TX_MODE.READONLY)
      const store = tx.objectStore(storeName)
      const req = store.openCursor()
      const results = []
      let skipped = 0

      req.onerror = () => reject(req.error)
      req.onsuccess = (event) => {
        const cursor = event.target.result
        if (!cursor) {
          resolve(results)
          return
        }

        if (filterFn(cursor.value)) {
          if (skipped < offset) {
            skipped++
          } else {
            results.push(cursor.value)
            if (limit !== null && results.length >= limit) {
              resolve(results)
              return
            }
          }
        }

        cursor.continue()
      }
    })
  }

  /**
   * Create all object stores at version 1.
   * @param {IDBDatabase} db
   */
  static ensureSchema(_db) {}
}

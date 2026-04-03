// IndexedDB.js
import { TX_MODE } from "./constants.js";

export class IndexedDB {
  static #db = null;

  /**
   * Initialize and open the IndexedDB database.
   * @param {string} dbName
   * @returns {Promise<IDBDatabase>}
   */
  static async init(dbName) {
    if (IndexedDB.#db) return IndexedDB.#db;
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(dbName, 1);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => {
        IndexedDB.#db = req.result;
        resolve(IndexedDB.#db);
      };
      req.onupgradeneeded = (event) => {
        this.ensureSchema(event.target.result);
      };
    });
  }

  /**
   * Persist a record to a model store.
   * @param {string} storeName
   * @param {object} record - must have `id` field
   */
  static async put(storeName, record) {
    return new Promise((resolve, reject) => {
      const tx = IndexedDB.#db.transaction(storeName, TX_MODE.READWRITE);
      const store = tx.objectStore(storeName);
      const req = store.put(record);
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => resolve(record);
    });
  }

  /**
   * Retrieve a record by id from a model store.
   * @param {string} storeName
   * @param {*} id
   * @returns {Promise<object|null>}
   */
  static async get(storeName, id) {
    return new Promise((resolve, reject) => {
      const tx = IndexedDB.#db.transaction(storeName, TX_MODE.READONLY);
      const store = tx.objectStore(storeName);
      const req = store.get(id);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve(req.result ?? null);
    });
  }

  /**
   * Retrieve all records from a model store.
   * @param {string} storeName
   * @returns {Promise<object[]>}
   */
  static async getAll(storeName) {
    return new Promise((resolve, reject) => {
      const tx = IndexedDB.#db.transaction(storeName, TX_MODE.READONLY);
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve(req.result ?? []);
    });
  }

  /**
   * Persist multiple records to a model store.
   * @param {string} storeName
   * @param {object[]} records - array of records, each must have `id` field
   */
  static async bulkPut(storeName, records) {
    return new Promise((resolve, reject) => {
      const tx = IndexedDB.#db.transaction(storeName, TX_MODE.READWRITE);
      const store = tx.objectStore(storeName);
      for (const record of records) {
        store.put(record);
      }
      tx.oncomplete = () => resolve(records);
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * Delete a record by id from a model store.
   * @param {string} storeName
   * @param {*} id
   */
  static async delete(storeName, id) {
    return new Promise((resolve, reject) => {
      const tx = IndexedDB.#db.transaction(storeName, TX_MODE.READWRITE);
      const store = tx.objectStore(storeName);
      const req = store.delete(id);
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => resolve();
    });
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
      const tx = IndexedDB.#db.transaction(storeName, TX_MODE.READONLY);
      const store = tx.objectStore(storeName);
      const index = store.index(indexName);
      const req = index.getAll(value);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve(req.result ?? []);
    });
  }

  /**
   * Create all object stores at version 1.
   * @param {IDBDatabase} db
   */
  static ensureSchema(db) {}
}

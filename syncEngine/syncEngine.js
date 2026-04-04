import { BaseModel } from './core/BaseModel.js'
import { IndexedDB } from './persistence/IndexedDB.js'
import { SyncTransaction } from './persistence/SyncTransaction.js'
import { TableMetaService } from './persistence/TableMetaService.js'
import { SyncWorkerBridge } from './worker/SyncWorkerBridge.js'
import { ObjectPool } from './core/ObjectPool.js'
import { MSG } from './shared/messageTypes.js'
import { shouldNuke, computeSchemaHash } from './persistence/schemaManager.js'
import { DB_NAME, SCHEMA_HASH_KEY } from './shared/constants.js'

export class SyncEngine {
  /**
   *
   * @type {SyncWorkerBridge}
   */
  #workerBridge = null

  /**
   * @type {string}
   */
  #rawDbName = null

  /**
   * Set after shouldNuke(). Cleared on successful init.
   * @type {string|null} - name of the DB to nuke on next init (if any).
   */
  #dbToNuke = null

  /**
   * if the DB name is sync-db-123, then the key will be sync-db-123_dbName to avoid collisions with other localStorage keys
   * and ensure SW and main thread are in sync on the active DB across reloads.
   */
  get #dbNameKey() {
    return `${this.#rawDbName}_dbName`
  }

  /**
   * DB name is persisted in localStorage to ensure SW and main thread are in sync across reloads.
   * @type {string | null}
   */
  get dbName() {
    return localStorage.getItem(this.#dbNameKey) || null
  }
  set dbName(name) {
    localStorage.setItem(this.#dbNameKey, name)
  }

  get workerBridge() {
    return this.#workerBridge
  }

  async install({
    dbName = DB_NAME,
    socketUrl,
    graphqlUrl,
    graphQLWorkerIntervalMs = 5000,
    graphqlClientOptions = {},
    serviceWorkerUrl,
  } = {}) {
    this.#rawDbName = dbName
    await this.#initDatabase(dbName)

    // Populate tableMetas for SW consumption
    await TableMetaService.populateAll()

    // Set save strategy to use SyncTransaction (OCP — no monkey-patching)
    if (!BaseModel._saveStrategy) {
      BaseModel._saveStrategy = async (instance) => {
        const changes = instance.getModifiedProperties()
        const transaction = new SyncTransaction(instance, changes, instance.action)
        await transaction.commit()
        instance._clearModified()
      }
    }

    // --- Service Worker path ---
    await this.#setupServiceWorker({
      serviceWorkerUrl,
      graphqlUrl,
      socketUrl,
      headers: graphqlClientOptions.headers,
      pollIntervalMs: graphQLWorkerIntervalMs,
    })

    this.#nukeDatabaseIfNeeded()
  }

  async #initDatabase(dbName) {
    if (shouldNuke()) {
      this.#dbToNuke = this.dbName
      this.dbName = `${dbName}-${Date.now()}`
      localStorage.setItem(SCHEMA_HASH_KEY, computeSchemaHash())
    } else if (!this.dbName) {
      // First run or new company — no entry in localStorage yet
      this.dbName = dbName
    }

    await IndexedDB.init(this.dbName)
    localStorage.setItem(SCHEMA_HASH_KEY, computeSchemaHash())
  }

  async #setupServiceWorker({ serviceWorkerUrl, graphqlUrl, socketUrl, headers, pollIntervalMs }) {
    if (this.#workerBridge) this.#workerBridge.stop()

    this.#workerBridge = new SyncWorkerBridge({
      onFlush: (entry) => console.log('[SyncEngine] Flushed:', entry),
      onError: (err) => console.error('[SyncEngine] SW error:', err),
    })

    await this.#workerBridge.register(serviceWorkerUrl)

    this.#workerBridge.sendMessage({
      type: this.#dbToNuke ? MSG.REINIT : MSG.INIT,
      dbName: this.dbName,
      graphqlUrl,
      socketUrl,
      headers: headers || {},
      pollIntervalMs,
    })
  }

  #nukeDatabaseIfNeeded() {
    if (this.#dbToNuke) {
      const req = indexedDB.deleteDatabase(this.#dbToNuke)
      req.onsuccess = () => console.log(`[SyncEngine] Nuked old database: ${this.#dbToNuke}`)
      req.onerror = () =>
        console.error(`[SyncEngine] Failed to nuke database: ${this.#dbToNuke}`, req.error)
      req.onblocked = () =>
        console.warn(`[SyncEngine] DB delete blocked by open connections: ${this.#dbToNuke}`)
      this.#dbToNuke = null
    }
  }

  disconnectSocket() {
    if (this.#workerBridge) {
      this.#workerBridge.stop()
    }
  }

  /**
   * Teardown the engine — stop SW, close IDB, clear in-memory pool.
   * Call before switching to a different company DB or on logout.
   */
  teardown() {
    if (this.#workerBridge) {
      this.#workerBridge.stop()
      this.#workerBridge = null
    }
    IndexedDB.close()
    ObjectPool.clear()
  }
}

export const syncEngine = new SyncEngine()

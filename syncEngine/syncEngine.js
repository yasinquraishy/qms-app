import { BaseModel } from './core/BaseModel.js'
import { IndexedDB } from './persistence/IndexedDB.js'
import { MetaCache } from './core/MetaCache.js'
import { ObjectPool } from './core/ObjectPool.js'
import { directSaveStrategy } from './core/directSaveStrategy.js'
import { bootstrapAll } from './sync/bootstrap.js'
import { initSocketSubscriber, teardownSocketSubscriber } from './sync/socketSubscriber.js'
import { shouldNuke, computeSchemaHash } from './persistence/schemaManager.js'
import { DB_NAME, SCHEMA_HASH_KEY } from './shared/constants.js'

export class SyncEngine {
  /**
   * @type {string}
   */
  #rawDbName = null

  /**
   * Set when a schema change is detected. Holds the old DB name to nuke after the new one opens.
   * @type {string|null}
   */
  #dbToNuke = null

  /**
   * DB name key in localStorage (scoped to rawDbName to avoid collisions).
   */
  get #dbNameKey() {
    return `${this.#rawDbName}_dbName`
  }

  /**
   * The active company-scoped IDB name, persisted in localStorage so it survives page reloads.
   * @type {string|null}
   */
  get dbName() {
    return localStorage.getItem(this.#dbNameKey) || null
  }
  set dbName(name) {
    localStorage.setItem(this.#dbNameKey, name)
  }

  /**
   * Install the syncEngine for a given company.
   *
   * Steps:
   *   1. Open (or create) the company-scoped IndexedDB.
   *   2. Build the in-memory MetaCache (GraphQL strings per model).
   *   3. Wire BaseModel._saveStrategy to call the API directly.
   *   4. Run the paginated delta-sync bootstrap (non-blocking).
   *   5. Attach the socket.io 'sync' listener for server-push updates.
   *
   * @param {{ dbName?: string }} [options]
   */
  async install({ dbName = DB_NAME } = {}) {
    this.#rawDbName = dbName
    await this.#initDatabase(dbName)

    // Build in-memory GraphQL string cache (replaces TableMetaService IDB store)
    MetaCache.build()

    // Wire direct-API save strategy (replaces SyncTransaction + TransactionQueue + SW poll)
    BaseModel._saveStrategy = directSaveStrategy

    // Bootstrap: paginated delta-sync for all INSTANT models (non-blocking)
    bootstrapAll().catch((err) => console.error('[SyncEngine] Bootstrap error:', err))

    // Socket subscriber: server-push sync via the existing app socket
    initSocketSubscriber()
  }

  async #initDatabase(dbName) {
    if (shouldNuke()) {
      this.#dbToNuke = this.dbName
    }

    if (!this.dbName || this.#dbToNuke !== null) {
      // First run or schema change — create a new timestamped DB
      this.dbName = `${dbName}-${Date.now()}`
    }

    await IndexedDB.init(this.dbName)
    localStorage.setItem(SCHEMA_HASH_KEY, computeSchemaHash())

    // Nuke the old DB immediately after the new one is open
    this.#nukeDatabaseIfNeeded()
  }

  #nukeDatabaseIfNeeded() {
    if (this.#dbToNuke) {
      const toNuke = this.#dbToNuke
      this.#dbToNuke = null
      const req = indexedDB.deleteDatabase(toNuke)
      req.onsuccess = () => console.log(`[SyncEngine] Nuked old database: ${toNuke}`)
      req.onerror = () =>
        console.error(`[SyncEngine] Failed to nuke database: ${toNuke}`, req.error)
      req.onblocked = () =>
        console.warn(`[SyncEngine] DB delete blocked by open connections: ${toNuke}`)
    }
  }

  /**
   * Teardown the engine — detach socket listener, close IDB, clear in-memory pool.
   * Call before switching to a different company DB or on logout.
   */
  teardown() {
    teardownSocketSubscriber()
    BaseModel._saveStrategy = null
    IndexedDB.close()
    ObjectPool.clear()
  }
}

export const syncEngine = new SyncEngine()

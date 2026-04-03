import { BaseModel } from "./core/BaseModel.js";
import { IndexedDB } from "./persistence/IndexedDB.js";
import { SyncTransaction } from "./persistence/SyncTransaction.js";
import { TableMetaService } from "./persistence/TableMetaService.js";
import { SyncWorkerBridge } from "./worker/SyncWorkerBridge.js";
import { MSG } from "./shared/messageTypes.js";
import { shouldNuke, computeSchemaHash } from "./persistence/schemaManager.js";
import { DB_NAME, SCHEMA_HASH_KEY } from "./shared/constants.js";

export class SyncEngine {
  #workerBridge = null;

  getWorkerBridge() {
    return this.#workerBridge;
  }

  async install({
    dbName = DB_NAME,
    socketUrl,
    graphqlUrl,
    graphQLWorkerIntervalMs = 5000,
    graphqlClientOptions = {},
    serviceWorkerUrl,
  } = {}) {
    await this.#initDatabase(dbName);

    // Populate tableMetas for SW consumption
    await TableMetaService.populateAll();

    // Set save strategy to use SyncTransaction (OCP — no monkey-patching)
    if (!BaseModel._saveStrategy) {
      BaseModel._saveStrategy = async (instance) => {
        const changes = instance.getModifiedProperties();
        const transaction = new SyncTransaction(
          instance,
          changes,
          instance.action,
        );
        await transaction.commit();
        instance._clearModified();
      };
    }

    // --- Service Worker path ---
    await this.#setupServiceWorker({
      serviceWorkerUrl,
      dbName,
      graphqlUrl,
      socketUrl,
      headers: graphqlClientOptions.headers,
      pollIntervalMs: graphQLWorkerIntervalMs,
    });
  }

  async #initDatabase(dbName) {
    if (shouldNuke()) {
      await new Promise((resolve, reject) => {
        const req = indexedDB.deleteDatabase(dbName);
        req.onsuccess = resolve;
        req.onerror = reject;
        req.onblocked = () =>
          console.warn("[SyncEngine] DB delete blocked by open connections");
      });
      localStorage.setItem(SCHEMA_HASH_KEY, computeSchemaHash());
    }

    await IndexedDB.init(dbName);
    localStorage.setItem(SCHEMA_HASH_KEY, computeSchemaHash());
  }

  async #setupServiceWorker({
    serviceWorkerUrl,
    dbName,
    graphqlUrl,
    socketUrl,
    headers,
    pollIntervalMs,
  }) {
    if (this.#workerBridge) this.#workerBridge.stop();

    this.#workerBridge = new SyncWorkerBridge({
      onFlush: (entry) => console.log("[SyncEngine] Flushed:", entry),
      onError: (err) => console.error("[SyncEngine] SW error:", err),
    });

    await this.#workerBridge.register(serviceWorkerUrl);

    this.#workerBridge.sendMessage({
      type: MSG.INIT,
      dbName,
      graphqlUrl,
      socketUrl,
      headers: headers || {},
      pollIntervalMs,
    });
  }

  disconnectSocket() {
    if (this.#workerBridge) {
      this.#workerBridge.stop();
    }
  }
}

export const syncEngine = new SyncEngine();

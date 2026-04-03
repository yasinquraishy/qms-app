// SyncTransaction.js
import { UpdateTransaction } from "../core/UpdateTransaction.js";
import { IndexedDB } from "./IndexedDB.js";
import { TransactionQueue } from "./TransactionQueue.js";
import ModelRegistry from "../core/ModelRegistry.js";
import {
  LOAD_STRATEGY,
  TRANSACTIONS_STORE,
  OPERATION,
} from "../shared/constants.js";
import { dehydrate, serializeValue, deserializeValue } from "./hydration.js";
import { ObjectPool } from "../core/ObjectPool.js";

export class SyncTransaction extends UpdateTransaction {
  #queueId = null;
  #action = OPERATION.UPDATE;

  constructor(model, changes, action = OPERATION.UPDATE) {
    super(model, changes);
    this.#action = action;
  }

  /**
   * Rollback a queue entry by restoring IndexedDB and ObjectPool state.
   * Used by GraphQLWorker when the server permanently rejects an entry.
   *
   * - CREATE → delete the record + unregister from pool
   * - UPDATE → overlay serialized old values onto newValues, write back
   * - DELETE → re-insert the pre-delete snapshot
   *
   * @param {object} entry - Queue entry with { modelName, modelId, action, newValues, changes }
   */
  static async rollbackQueueEntry(entry) {
    const schema = ModelRegistry.getSchema(entry.modelName);
    if (!schema) return;

    const tableName = schema.tableName;

    switch (entry.action) {
      case OPERATION.CREATE: {
        await IndexedDB.delete(tableName, entry.modelId);
        ObjectPool.unregister(entry.modelName, entry.modelId);
        break;
      }
      case OPERATION.UPDATE: {
        if (entry.changes && entry.newValues) {
          const restoredRecord = {
            ...entry.newValues,
            ...entry.changes,
          };
          await IndexedDB.put(tableName, restoredRecord);

          // Update ObjectPool instance if loaded (apply deserialized old values)
          const poolInstance = ObjectPool.get(entry.modelName, entry.modelId);
          if (poolInstance) {
            const propertyMetaMap = schema.properties;
            for (const [key, serializedVal] of Object.entries(entry.changes)) {
              poolInstance[key] = deserializeValue(
                serializedVal,
                propertyMetaMap.get(key),
              );
            }
            poolInstance._clearModified();
          }
        }
        break;
      }
      case OPERATION.DELETE: {
        if (entry.newValues) {
          await IndexedDB.put(tableName, entry.newValues);
        }
        break;
      }
    }
  }

  /** @returns {string} */
  get modelName() {
    // Derive model name from constructor name via ModelRegistry reverse lookup
    for (const [name, ctor] of Object.entries(ModelRegistry.modelLookup)) {
      if (this.model.constructor === ctor) return name;
    }
    return this.model.constructor.name;
  }

  /**
   * Commit writes to IndexedDB and enqueues to TransactionQueue.
   * Skips queue for 'local' loadStrategy.
   */
  async commit() {
    if (this.committed) return this;

    const schema = ModelRegistry.getSchema(this.modelName);
    const pk = schema.primaryKey;
    const id = this.model[pk];
    const tableName = ModelRegistry.getTableName(this.modelName);

    // Capture old IDB record for atomicity rollback
    const oldRecord = await IndexedDB.get(tableName, id);

    try {
      let newValues = {};
      let patch = {};
      let changes = null;

      if (this.#action === OPERATION.DELETE) {
        // Dehydrate BEFORE delete so we have a full snapshot for rollback
        newValues = await dehydrate(this.modelName, this.model);
        await IndexedDB.delete(tableName, id);
        // For delete rollback, changes is the full snapshot (restore entire record)
        changes = newValues;
      } else {
        // Persist model data to IndexedDB using pk as keyPath
        newValues = await dehydrate(this.modelName, this.model);

        // Build serialized patch: only the changed fields' new values (network-ready)
        const changedKeys = Object.keys(this.changes);
        for (const key of changedKeys) {
          if (key in newValues) {
            patch[key] = newValues[key];
          }
        }

        // Serialize old values for rollback
        if (this.#action !== OPERATION.CREATE) {
          const propertyMetaMap = schema.properties;
          changes = {};
          for (const [key, oldValue] of Object.entries(this.changes)) {
            changes[key] = serializeValue(oldValue, propertyMetaMap.get(key));
          }
        }
      }

      // Enqueue for async network sync (skip for 'local' loadStrategy)
      if (schema?.loadStrategy !== LOAD_STRATEGY.LOCAL) {
        this.#queueId = await TransactionQueue.append(
          this.modelName,
          id,
          changes,
          newValues,
          patch,
          this.#action,
        );
      }

      this.committed = true;
      return this;
    } catch (err) {
      // Rollback queue entry if it was appended
      if (this.#queueId) {
        await IndexedDB.delete(TRANSACTIONS_STORE, this.#queueId).catch(
          () => {},
        );
        this.#queueId = null;
      }

      // Restore IndexedDB to pre-commit state
      switch (this.#action) {
        case OPERATION.CREATE:
          await IndexedDB.delete(tableName, id).catch(() => {});
          break;
        case OPERATION.DELETE:
        case OPERATION.UPDATE:
          if (oldRecord) {
            await IndexedDB.put(tableName, oldRecord).catch(() => {});
          }
          break;
      }

      throw err;
    }
  }

  /**
   * Rollback restores old values and deletes the queue entry (auto-rollback on failure).
   */
  async rollback() {
    if (this.#queueId) {
      await IndexedDB.delete(TRANSACTIONS_STORE, this.#queueId);
      this.#queueId = null;
    }
    return super.rollback();
  }
}

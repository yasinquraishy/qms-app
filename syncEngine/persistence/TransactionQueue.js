// TransactionQueue.js
import { ClientModel, Property, BaseModel } from "../index.js";
import { IndexedDB } from "./IndexedDB.js";
import {
  TRANSACTIONS_STORE,
  STATUS,
  OPERATION,
  LOAD_STRATEGY,
} from "../shared/constants.js";

@ClientModel(TRANSACTIONS_STORE, { loadStrategy: LOAD_STRATEGY.LOCAL })
class TransactionQueue extends BaseModel {
  // NOTE: primaryKey is set via @ClientModel options (primaryKey: 'id'), not here.
  static customIndex = "status, [modelName+modelId]";

  @Property({ type: String }) id = "";
  @Property({ type: String }) modelName = "";
  @Property({ type: String }) modelId = "";
  @Property({ type: Object }) changes = {}; // { fieldName: serializedOldValue } — for rollback
  @Property({ type: Object }) newValues = {}; // { fieldName: newValue } — full snapshot for sync server
  @Property({ type: Object }) patch = {}; // { fieldName: serializedNewValue } — only changed fields, network-ready
  @Property({ type: String }) action = OPERATION.UPDATE;
  @Property({ type: String }) status = STATUS.PENDING;
  @Property({ type: Number }) createdAt = 0;

  /**
   * Append a queue entry directly via IndexedDB.put (skip save() to avoid recursion).
   * @param {string} modelName
   * @param {*} modelId
   * @param {object} changes — serialized old values for rollback
   * @param {object} newValues
   * @param {object} patch — serialized new values for only changed fields
   * @param {string} [action=OPERATION.UPDATE]
   * @returns {Promise<string>} queue entry id
   */
  static async append(
    modelName,
    modelId,
    changes,
    newValues,
    patch,
    action = OPERATION.UPDATE,
  ) {
    const id = crypto.randomUUID();
    const entry = {
      id,
      modelName,
      modelId,
      changes,
      newValues,
      patch,
      action,
      status: STATUS.PENDING,
      createdAt: Date.now(),
    };
    // Write directly to IndexedDB — bypass save() to avoid recursion through SyncTransaction
    await IndexedDB.put(TRANSACTIONS_STORE, entry);
    return id;
  }

  /**
   * Get all PENDING entries as hydrated TransactionQueue instances.
   * @returns {Promise<TransactionQueue[]>}
   */
  static async getPending() {
    return this.where({ status: STATUS.PENDING }).exec();
  }

  /**
   * Mark a queue entry as synced (delete it).
   * @param {string} id
   */
  async markSynced() {
    await this.delete();
  }
}

export { TransactionQueue };

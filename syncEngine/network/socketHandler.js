import ModelRegistry from "../core/ModelRegistry.js";

/**
 * Check if there are pending outbound transactions for a given model + id.
 * @param {object} persistence - { getAll, put, delete }
 * @param {string} transactionsStore - store name for transactions
 * @param {string} statusPending - pending status constant
 * @param {string} modelName
 * @param {*} modelId
 * @returns {Promise<boolean>}
 */
async function hasPendingTransaction(
  persistence,
  transactionsStore,
  statusPending,
  modelName,
  modelId,
) {
  try {
    const pending = await persistence.getAll(transactionsStore);
    return pending.some(
      (entry) =>
        entry.status === statusPending &&
        entry.modelName === modelName &&
        String(entry.modelId) === String(modelId),
    );
  } catch {
    return false;
  }
}

/**
 * Apply deserialized values from a raw record to an existing ObjectPool instance.
 * @param {object} instance
 * @param {object} data - raw (serialized) data from server
 * @param {Map} propertyMetaMap - schema.properties
 * @param {string} pk - primary key field name
 * @param {Function} deserialize - (value, meta) => deserialized value
 */
function applyToInstance(instance, data, propertyMetaMap, pk, deserialize) {
  for (const [key, value] of Object.entries(data)) {
    if (key === pk) continue; // skip pk
    instance[key] = deserialize(value, propertyMetaMap.get(key));
  }
  instance._clearModified();
}

/**
 * Handle incoming socket events and sync to IndexedDB.
 * @param {object} socket - Socket.IO socket instance
 * @param {object} deps - injected dependencies
 * @param {{ put: Function, delete: Function, getAll: Function }} deps.persistence
 * @param {{ get: Function, unregister: Function }} deps.objectPool
 * @param {Function} deps.deserialize - (value, meta) => deserialized value
 * @param {string} deps.transactionsStore - store name for pending transactions
 * @param {string} deps.statusPending - pending status constant value
 */
export function setupSocketHandler(
  socket,
  { persistence, objectPool, deserialize, transactionsStore, statusPending },
) {
  socket.on("sync", async (payload) => {
    const { table, action, data } = payload;

    if (!table || !action) {
      console.warn("[socketHandler] Missing table or action", payload);
      return;
    }

    const schema = ModelRegistry.getSchema(table);
    if (!schema) {
      console.warn(`[socketHandler] Unknown table: ${table}`);
      return;
    }

    const pk = schema.primaryKey;
    const modelName = table;

    try {
      switch (action) {
        case "create":
        case "update": {
          if (!data || !data[pk]) {
            console.warn(
              `[socketHandler] ${action}: missing primary key ${pk}`,
              data,
            );
            return;
          }

          // Skip if local changes are pending for this record (local-first)
          if (
            await hasPendingTransaction(
              persistence,
              transactionsStore,
              statusPending,
              modelName,
              data[pk],
            )
          ) {
            console.warn(
              `[socketHandler] Skipping incoming ${action} for ${modelName}:${data[pk]} — local changes pending`,
            );
            return;
          }

          await persistence.put(schema.tableName, data);

          // Update ObjectPool instance if it exists (apply deserialized values)
          const existing = objectPool.get(modelName, data[pk]);
          if (existing) {
            applyToInstance(existing, data, schema.properties, pk, deserialize);
          }
          break;
        }

        case "delete": {
          if (!data || !data[pk]) {
            console.warn(
              `[socketHandler] delete: missing primary key ${pk}`,
              data,
            );
            return;
          }

          if (
            await hasPendingTransaction(
              persistence,
              transactionsStore,
              statusPending,
              modelName,
              data[pk],
            )
          ) {
            console.warn(
              `[socketHandler] Skipping incoming delete for ${modelName}:${data[pk]} — local changes pending`,
            );
            return;
          }

          await persistence.delete(schema.tableName, data[pk]);
          objectPool.unregister(modelName, data[pk]);
          break;
        }

        default:
          console.warn(`[socketHandler] Unknown action: ${action}`);
          socket.emit("error", { type: "unknownAction", action, payload });
      }
    } catch (err) {
      console.error(`[socketHandler] Failed to ${action} ${modelName}:`, err);
    }
  });
}

import { IndexedDB } from "../../shared/IndexedDB.js";
import { broadcastMessage } from "./broadcaster.js";
import { MSG } from "../../shared/messageTypes.js";

/**
 * Rollback an entry by restoring IDB state and notifying main thread.
 * @param {object} entry - Queue entry
 * @param {object} meta - tableMeta record
 */
export async function rollbackEntry(entry, meta) {
  const tableName = meta.tableName;

  switch (entry.action) {
    case "create":
      await IndexedDB.delete(tableName, entry.modelId);
      await broadcastMessage({
        type: MSG.ROLLBACK,
        modelName: entry.modelName,
        modelId: entry.modelId,
        action: "create",
      });
      break;

    case "update":
      if (entry.changes && entry.newValues) {
        const restored = { ...entry.newValues, ...entry.changes };
        await IndexedDB.put(tableName, restored);
        await broadcastMessage({
          type: MSG.ROLLBACK,
          modelName: entry.modelName,
          modelId: entry.modelId,
          action: "update",
        });
      }
      break;

    case "delete":
      if (entry.newValues) {
        await IndexedDB.put(tableName, entry.newValues);
        await broadcastMessage({
          type: MSG.ROLLBACK,
          modelName: entry.modelName,
          modelId: entry.modelId,
          action: "delete",
        });
      }
      break;
  }
}

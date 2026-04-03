import { io } from "socket.io-client";
import { IndexedDB } from "../../shared/IndexedDB.js";
import { TRANSACTIONS_STORE, STATUS } from "../../shared/constants.js";
import { broadcastMessage } from "./broadcaster.js";
import { MSG } from "../../shared/messageTypes.js";

let socket = null;

/**
 * Connect Socket.IO in WS-only mode and handle incoming "sync" events.
 * @param {object} config - { socketUrl, ... }
 * @param {Map} metaByTable - tableName → tableMeta
 */
export function connectSocket(config, metaByTable) {
  disconnectSocket();

  socket = io(config.socketUrl, {
    transports: ["websocket"],
    autoConnect: true,
  });

  socket.on("sync", async (payload) => {
    const { table, action, data } = payload;
    if (!table || !action) return;

    const meta = metaByTable.get(table);
    if (!meta) return;

    const pk = meta.primaryKey;

    try {
      if (action === "create" || action === "update") {
        if (!data?.[pk]) return;
        if (await hasPendingTransaction(meta.modelName, data[pk])) return;
        await IndexedDB.put(table, data);
      } else if (action === "delete") {
        if (!data?.[pk]) return;
        if (await hasPendingTransaction(meta.modelName, data[pk])) return;
        await IndexedDB.delete(table, data[pk]);
      }

      await broadcastMessage({
        type: MSG.SYNC,
        modelName: meta.modelName,
        modelId: data[pk],
        action,
      });
    } catch (err) {
      console.error(`[SW socketHandler] Failed: ${action} ${table}`, err);
    }
  });
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

async function hasPendingTransaction(modelName, modelId) {
  try {
    const pending = await IndexedDB.getByIndex(
      TRANSACTIONS_STORE,
      "status",
      STATUS.PENDING,
    );
    return pending.some(
      (e) => e.modelName === modelName && String(e.modelId) === String(modelId),
    );
  } catch {
    return false;
  }
}

import { MSG } from "../../shared/messageTypes.js";
import { IndexedDB } from "../../shared/IndexedDB.js";
import { loadMetas } from "./metaLoader.js";
import { startPolling, stopPolling } from "./mutationPoller.js";
import { connectSocket, disconnectSocket } from "./socketHandler.js";

let config = null;
let metas = { metaMap: new Map(), metaByTable: new Map() };

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("message", async (event) => {
  const { type, ...payload } = event.data;

  switch (type) {
    case MSG.INIT: {
      config = payload;
      await IndexedDB.init(config.dbName);
      metas = await loadMetas();
      startPolling(metas.metaMap, config);
      if (config.socketUrl) connectSocket(config, metas.metaByTable);
      break;
    }
    case MSG.STOP: {
      stopPolling();
      disconnectSocket();
      break;
    }
    case MSG.REFRESH_METAS: {
      metas = await loadMetas();
      break;
    }
  }
});

import { MSG } from '../../shared/messageTypes.js'
import { SW_STATE } from '../../shared/constants.js'
import { IndexedDB } from '../../shared/IndexedDB.js'
import { loadMetas } from './metaLoader.js'
import { startPolling, stopPolling } from './mutationPoller.js'
import { connectSocket, disconnectSocket } from './socketHandler.js'
import { bootstrapAll } from './bootstrap.js'
import { broadcastMessage } from './broadcaster.js'

// ─── State ────────────────────────────────────────────────────────────────────

const state = {
  config: null,
  metas: { metaMap: new Map(), metaByTable: new Map() },
  sw: SW_STATE.IDLE,
  isOffline: false,
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()))

// ─── Network ──────────────────────────────────────────────────────────────────

self.addEventListener('online', () => {
  state.isOffline = false

  if (state.sw === SW_STATE.READY) {
    startServices()
  } else if (state.sw === SW_STATE.BOOTSTRAPPING && state.config) {
    // Bootstrap was skipped while offline — retry now
    runBootstrap()
  }
})

self.addEventListener('offline', () => {
  state.isOffline = true
  stopServices()
})

// ─── Core logic ───────────────────────────────────────────────────────────────

function startServices() {
  startPolling(state.metas.metaMap, state.config)
  if (state.config?.socketUrl) connectSocket(state.config, state.metas.metaByTable)
}

function stopServices() {
  stopPolling()
  disconnectSocket()
}

async function runBootstrap() {
  const wasSkipped = await bootstrapAll(state.metas.metaMap, state.config)
  if (!wasSkipped) {
    state.sw = SW_STATE.READY
    if (!state.isOffline) startServices()
  }
  // wasSkipped → state remains BOOTSTRAPPING; retried when 'online' fires
}

async function doInit(config) {
  try {
    state.config = config
    await IndexedDB.init(config.dbName)
    state.metas = await loadMetas()
    state.sw = SW_STATE.BOOTSTRAPPING
    await runBootstrap()
  } catch (err) {
    state.sw = SW_STATE.IDLE
    await broadcastMessage({ type: MSG.ERROR, error: { message: err.message, stack: err.stack } })
  }
}

function teardown() {
  stopServices()
  IndexedDB.close()
  state.sw = SW_STATE.IDLE
  state.config = null
}

// ─── Message handler ──────────────────────────────────────────────────────────

async function messageHandler(event) {
  const { type, ...payload } = event.data

  switch (type) {
    case MSG.INIT: {
      if (state.sw === SW_STATE.READY) {
        await broadcastMessage({ type: MSG.BOOTSTRAP_COMPLETE })
      } else if (state.sw === SW_STATE.IDLE) {
        await doInit(payload)
      }
      // BOOTSTRAPPING → no-op; already in progress
      break
    }

    case MSG.REINIT: {
      // Schema change — tear down and re-initialise against the new DB
      teardown()
      await doInit(payload)
      break
    }

    case MSG.STOP: {
      teardown()
      break
    }

    case MSG.REFRESH_METAS: {
      state.metas = await loadMetas()
      if (state.sw === SW_STATE.READY) {
        stopServices()
        startServices()
      }
      break
    }

    case MSG.GET_STATUS: {
      await broadcastMessage({ type: MSG.STATUS, state: state.sw })
      break
    }
  }
}

self.addEventListener('message', messageHandler)

// ─── Self-termination ─────────────────────────────────────────────────────────

const IDLE_CHECK_INTERVAL = 5 * 60 * 1000 // 5 minutes

setInterval(async () => {
  const clients = await self.clients.matchAll({ type: 'window' })
  if (clients.length === 0) teardown()
}, IDLE_CHECK_INTERVAL)

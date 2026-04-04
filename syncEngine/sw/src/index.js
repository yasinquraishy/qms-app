import { MSG } from '../../shared/messageTypes.js'
import { SW_STATE } from '../../shared/constants.js'
import { IndexedDB } from '../../shared/IndexedDB.js'
import { loadMetas } from './metaLoader.js'
import { startPolling, stopPolling } from './mutationPoller.js'
import { connectSocket, disconnectSocket } from './socketHandler.js'
import { bootstrapAll } from './bootstrap.js'
import { broadcastMessage } from './broadcaster.js'

let config = null
let metas = { metaMap: new Map(), metaByTable: new Map() }
let swState = SW_STATE.IDLE
let isOffline = false

async function hasActiveClients() {
  const clientsList = await self.clients.matchAll({ type: 'window' })
  return clientsList.length > 0
}

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('online', () => {
  isOffline = false
  if (swState === SW_STATE.READY) {
    startPolling(metas.metaMap, config)
    if (config?.socketUrl) connectSocket(config, metas.metaByTable)
  }
})

self.addEventListener('offline', () => {
  isOffline = true
  stopPolling()
  disconnectSocket()
})

async function doInit(payload) {
  config = payload
  await IndexedDB.init(config.dbName)
  metas = await loadMetas()
  swState = SW_STATE.BOOTSTRAPPING
  await bootstrapAll(metas.metaMap, config)
  swState = SW_STATE.READY
  if (!isOffline) {
    startPolling(metas.metaMap, config)
    if (config.socketUrl) connectSocket(config, metas.metaByTable)
  }
}

async function messageHandler(event) {
  const { type, ...payload } = event.data

  switch (type) {
    case MSG.INIT: {
      if (swState === SW_STATE.READY) {
        await broadcastMessage({ type: MSG.BOOTSTRAP_COMPLETE })
        break
      }
      if (swState === SW_STATE.BOOTSTRAPPING) break
      // IDLE — full init
      await doInit(payload)
      break
    }
    case MSG.REINIT: {
      // Schema nuke — tear down current state, re-init against new DB
      stopPolling()
      disconnectSocket()
      IndexedDB.close()
      swState = SW_STATE.IDLE
      await doInit(payload)
      break
    }
    case MSG.STOP: {
      stopPolling()
      disconnectSocket()
      IndexedDB.close()
      swState = SW_STATE.IDLE
      config = null
      break
    }
    case MSG.REFRESH_METAS: {
      metas = await loadMetas()
      break
    }
    case MSG.GET_STATUS: {
      await broadcastMessage({ type: MSG.STATUS, state: swState })
      break
    }
  }
}

self.addEventListener('message', messageHandler)

setInterval(
  async () => {
    const active = await hasActiveClients()
    if (!active) {
      messageHandler({ data: { type: MSG.STOP } }) // self-terminate if no active clients after 5m
    }
  },
  5 * 60 * 1000,
)

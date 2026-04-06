import { io } from 'socket.io-client'
import { IndexedDB } from '../../shared/IndexedDB.js'
import { TRANSACTIONS_STORE, STATUS, TABLE_METAS_STORE } from '../../shared/constants.js'
import { broadcastMessage } from './broadcaster.js'
import { MSG } from '../../shared/messageTypes.js'
import { graphqlRequest } from './graphqlClient.js'

let socket = null

/**
 * Connect Socket.IO in WS-only mode and handle incoming "sync" events.
 * @param {object} config - { socketUrl, ... }
 * @param {Map} metaByTable - tableName → tableMeta
 */
export function connectSocket(config, metaByTable) {
  disconnectSocket()

  socket = io(config.socketUrl, {
    transports: ['websocket'],
    autoConnect: true,
  })

  socket.on('sync', async (payload) => {
    const { table, action, pkValue } = payload
    if (!table || !action) return

    const meta = metaByTable.get(table)
    if (!meta) return

    try {
      if (!pkValue) return
      if (await hasPendingTransaction(meta.modelName, pkValue)) return

      let resolvedAction = action

      if (action === 'create' || action === 'update') {
        const responseData = await graphqlRequest(
          config.graphqlUrl,
          config.headers,
          meta.fetchQuery,
          { [meta.fetchVariableName]: pkValue },
        )
        const record = responseData?.[meta.singularName]
        if (record) {
          await IndexedDB.put(table, record)
          if (meta.syncField) {
            const newValue = record[meta.syncField]
            if (newValue != null) {
              const storedMeta = await IndexedDB.get(TABLE_METAS_STORE, table)
              if (
                storedMeta &&
                (storedMeta.lastSyncValue === null || newValue > storedMeta.lastSyncValue)
              ) {
                storedMeta.lastSyncValue = newValue
                await IndexedDB.put(TABLE_METAS_STORE, storedMeta)
              }
            }
          }
        } else {
          await IndexedDB.delete(table, pkValue)
          resolvedAction = 'delete'
        }
      } else if (action === 'delete') {
        await IndexedDB.delete(table, pkValue)
      }

      await broadcastMessage({
        type: MSG.SYNC,
        modelName: meta.modelName,
        modelId: pkValue,
        action: resolvedAction,
      })
    } catch (err) {
      console.error(`[SW socketHandler] Failed: ${action} ${table}`, err)
    }
  })
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

async function hasPendingTransaction(modelName, modelId) {
  try {
    const pending = await IndexedDB.getByIndex(TRANSACTIONS_STORE, '[modelName+modelId]', [
      modelName,
      String(modelId),
    ])
    return pending.some((e) => e.status === STATUS.PENDING)
  } catch {
    return false
  }
}

import { IndexedDB } from '../../shared/IndexedDB.js'
import { TRANSACTIONS_STORE, STATUS, TABLE_METAS_STORE } from '../../shared/constants.js'
import { graphqlRequest } from './graphqlClient.js'
import { buildMutationFromEntry } from './variableBuilder.js'
import { rollbackEntry } from './rollback.js'
import { broadcastMessage } from './broadcaster.js'
import { MSG } from '../../shared/messageTypes.js'

let pollTimer = null
let pollInterval = 5000
let backoffMs = 5000
const MAX_BACKOFF = 60000

let _metaMap = null
let _config = null

export function startPolling(metaMap, config) {
  stopPolling()
  _metaMap = metaMap
  _config = config
  pollInterval = config.pollIntervalMs || 5000
  backoffMs = pollInterval
  scheduleNext()
}

export function stopPolling() {
  if (pollTimer) {
    clearTimeout(pollTimer)
    pollTimer = null
  }
}

function scheduleNext() {
  pollTimer = setTimeout(() => poll(), backoffMs)
}

async function poll() {
  try {
    const pending = await IndexedDB.getByIndex(TRANSACTIONS_STORE, 'status', STATUS.PENDING)
    if (pending.length > 0) {
      await flush(pending)
      backoffMs = pollInterval
    }
  } catch (err) {
    await broadcastMessage({
      type: MSG.ERROR,
      error: { message: err.message, stack: err.stack, source: 'poll' },
    })
    backoffMs = Math.min(backoffMs * 2, MAX_BACKOFF)
  } finally {
    scheduleNext()
  }
}

async function flush(entries) {
  for (const entry of entries) {
    const meta = _metaMap.get(entry.modelName)
    if (!meta) continue

    try {
      const { mutation, variables } = buildMutationFromEntry(entry, meta)
      const data = await graphqlRequest(_config.graphqlUrl, _config.headers, mutation, variables)
      if (meta.syncField && (entry.action === 'create' || entry.action === 'update')) {
        const wrapper = Object.values(data)[0]
        const record = wrapper?.[meta.singularName]
        const newValue = record?.[meta.syncField]
        if (newValue != null) {
          const storedMeta = await IndexedDB.get(TABLE_METAS_STORE, meta.tableName)
          if (
            storedMeta &&
            (storedMeta.lastSyncValue === null || newValue > storedMeta.lastSyncValue)
          ) {
            storedMeta.lastSyncValue = newValue
            await IndexedDB.put(TABLE_METAS_STORE, storedMeta)
          }
        }
      }
      await IndexedDB.delete(TRANSACTIONS_STORE, entry.id)
      await broadcastMessage({
        type: MSG.FLUSH,
        entry: {
          modelName: entry.modelName,
          modelId: entry.modelId,
          action: entry.action,
        },
      })
    } catch (err) {
      const status = err?.status
      const isPermanent = status === 400 || status === 409 || status === 422
      if (isPermanent) {
        await rollbackEntry(entry, meta)
        await IndexedDB.delete(TRANSACTIONS_STORE, entry.id)
        await broadcastMessage({
          type: MSG.ERROR,
          error: {
            message: err.message,
            rollback: true,
            source: 'flush',
            entry: {
              modelName: entry.modelName,
              modelId: entry.modelId,
              action: entry.action,
            },
          },
        })
        continue
      }
      await broadcastMessage({
        type: MSG.ERROR,
        error: { message: err.message, stack: err.stack, source: 'flush' },
      })
      throw err
    }
  }
}

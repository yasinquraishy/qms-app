import { IndexedDB } from '../../shared/IndexedDB.js'
import { TABLE_METAS_STORE } from '../../shared/constants.js'
import { graphqlRequest } from './graphqlClient.js'
import { broadcastMessage } from './broadcaster.js'
import { MSG } from '../../shared/messageTypes.js'

const PAGE_SIZE = 100

/**
 * Bootstrap all models in parallel. Broadcasts MSG.BOOTSTRAP_COMPLETE when done.
 * If offline, broadcasts immediately with skipped=true.
 * One model failing does not block the others (Promise.allSettled).
 * @param {Map<string, object>} metaMap  modelName → tableMeta
 * @param {{ graphqlUrl: string, headers: object }} config
 */
/**
 * @returns {Promise<boolean>} true if bootstrap was skipped (offline), false if it ran
 */
export async function bootstrapAll(metaMap, config, signal) {
  if (!navigator.onLine) {
    await broadcastMessage({ type: MSG.BOOTSTRAP_COMPLETE, skipped: true, reason: 'offline' })
    return true
  }

  const allMetas = [...metaMap.values()]
  const results = await Promise.allSettled(
    allMetas.map((meta) => bootstrapModel(meta, config, signal)),
  )

  const failed = allMetas
    .filter((_, i) => results[i].status === 'rejected')
    .map((meta) => meta.modelName)

  await broadcastMessage({
    type: MSG.BOOTSTRAP_COMPLETE,
    ...(failed.length > 0 ? { failed } : {}),
  })

  await Promise.allSettled(
    failed.map((modelName) =>
      broadcastMessage({ type: MSG.BOOTSTRAP, modelName, count: 0, error: 'Bootstrap failed' }),
    ),
  )

  return false
}

/**
 * Fetch all pages for a single model, upsert nodes into IDB, then update lastSyncValue.
 * Uses delta-sync filter when meta.syncField is set and meta.lastSyncValue is not null.
 * @param {object} meta  tableMeta record
 * @param {{ graphqlUrl: string, headers: object }} config
 */
async function bootstrapModel(meta, config, signal) {
  let after = null
  let totalCount = 0
  let maxSyncValue = meta.lastSyncValue !== null ? meta.lastSyncValue : null

  while (true) {
    if (signal?.aborted) throw new DOMException('Bootstrap aborted', 'AbortError')

    const variables = { first: PAGE_SIZE }

    if (after) variables.after = after

    if (meta.syncField && meta.lastSyncValue !== null) {
      variables.filter = { [meta.syncField]: { greaterThan: meta.lastSyncValue } }
    }

    if (meta.syncField && meta.fetchAllOrderBy) {
      variables.orderBy = [meta.fetchAllOrderBy]
    }

    const data = await graphqlRequest(
      config.graphqlUrl,
      config.headers,
      meta.fetchAllQuery,
      variables,
      signal,
    )
    const collection = data[meta.tableName]
    const nodes = collection?.nodes ?? []
    const pageInfo = collection?.pageInfo ?? {}

    if (nodes.length > 0) {
      await IndexedDB.bulkPut(meta.tableName, nodes)
      totalCount += nodes.length

      if (meta.syncField) {
        for (const node of nodes) {
          const val = node[meta.syncField]
          if (val != null && (maxSyncValue === null || val > maxSyncValue)) {
            maxSyncValue = val
          }
        }
      }
    }

    if (!pageInfo.hasNextPage || !pageInfo.endCursor) {
      if (meta.syncField && maxSyncValue !== meta.lastSyncValue) {
        const storedMeta = await IndexedDB.get(TABLE_METAS_STORE, meta.tableName)
        if (storedMeta) {
          storedMeta.lastSyncValue = maxSyncValue
          await IndexedDB.put(TABLE_METAS_STORE, storedMeta)
        }
      }

      await broadcastMessage({ type: MSG.BOOTSTRAP, modelName: meta.modelName, count: totalCount })
      return
    }

    after = pageInfo.endCursor
  }
}

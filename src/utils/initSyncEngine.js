import { syncEngine } from '@syncEngine/syncEngine.js'
import '@models/index.js'

const DB_PREFIX = 'qms-'

/**
 * Install (or reinstall) the syncEngine with a company-scoped IndexedDB.
 * @param {string} companyId
 */
export async function initSync(companyId) {
  if (!companyId) return

  await syncEngine.install({
    dbName: `${DB_PREFIX}${companyId}`,
    serviceWorkerUrl: '/sync-worker.js',
    graphqlUrl: '/api/graphql',
    socketUrl: '/sync',
  })
}

/**
 * Teardown the current syncEngine (close IDB, stop SW, clear pool).
 */
export function teardownSync() {
  syncEngine.teardown()
}

/**
 * Delete all qms-* IndexedDB databases.
 * Called on logout to wipe offline data.
 */
export async function deleteAllSyncDatabases() {
  teardownSync()

  if (!indexedDB.databases) return // unsupported browser fallback

  const databases = await indexedDB.databases()
  const deletions = databases
    .filter((db) => db.name?.startsWith(DB_PREFIX))
    .map(
      (db) =>
        new Promise((resolve) => {
          const req = indexedDB.deleteDatabase(db.name)
          req.onsuccess = resolve
          req.onerror = resolve // best-effort — don't block logout
          req.onblocked = resolve
        }),
    )

  await Promise.all(deletions)
}

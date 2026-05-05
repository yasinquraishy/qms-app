/**
 * bootstrapGate — controls whether bootstrapAll() should run for a given DB.
 *
 * Stores a JSON entry in localStorage keyed by `syncEngine:bootstrap:{dbName}`:
 *   { startedAt: number, completedAt?: number }
 *
 * Decision table:
 *   No entry                              → run
 *   startedAt < 60s ago, no completedAt  → skip (another tab is in progress)
 *   startedAt ≥ 60s ago, no completedAt  → stale lock, run
 *   completedAt < 5 min ago              → skip (data is fresh)
 *   completedAt ≥ 5 min ago              → run (data is stale)
 */

import {
  BOOTSTRAP_KEY_PREFIX,
  BOOTSTRAP_TTL_MS,
  BOOTSTRAP_LOCK_TTL_MS,
} from '../shared/constants.js'

function getKey(dbName) {
  return `${BOOTSTRAP_KEY_PREFIX}${dbName}`
}

function readEntry(dbName) {
  try {
    const raw = localStorage.getItem(getKey(dbName))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeEntry(dbName, entry) {
  localStorage.setItem(getKey(dbName), JSON.stringify(entry))
}

/**
 * Returns true if bootstrap should run for this dbName.
 * @param {string} dbName
 * @returns {boolean}
 */
export function shouldBootstrap(dbName) {
  const entry = readEntry(dbName)
  const now = Date.now()

  if (!entry) return true

  if (!entry.completedAt) {
    // Another tab started but hasn't finished — check if lock is stale
    return now - entry.startedAt >= BOOTSTRAP_LOCK_TTL_MS
  }

  // Completed — check TTL
  return now - entry.completedAt >= BOOTSTRAP_TTL_MS
}

/**
 * Record that bootstrap has started (acts as a distributed lock for parallel tabs).
 * @param {string} dbName
 */
export function markBootstrapStarted(dbName) {
  writeEntry(dbName, { startedAt: Date.now() })
}

/**
 * Record that bootstrap completed successfully.
 * Preserves the original startedAt.
 * @param {string} dbName
 */
export function markBootstrapComplete(dbName) {
  const entry = readEntry(dbName) ?? {}
  writeEntry(dbName, { startedAt: entry.startedAt ?? Date.now(), completedAt: Date.now() })
}

/**
 * Remove the gate entry entirely.
 * Call on teardown (logout) and on bootstrap failure so the next reload retries.
 * @param {string} dbName
 */
export function clearBootstrapGate(dbName) {
  localStorage.removeItem(getKey(dbName))
}

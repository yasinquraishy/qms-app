// schemaManager.js
import ModelRegistry from '../core/ModelRegistry.js'
import { SCHEMA_HASH_KEY } from '../shared/constants.js'

/**
 * djb2 hash — fast, dependency-free, good enough for schema versioning.
 * @param {string} str
 * @returns {string} hex string
 */
export function simpleHash(str) {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i)
    hash = hash >>> 0 // force unsigned 32-bit
  }
  return hash.toString(16)
}

/**
 * Compute aggregate schemaHash from all registered ModelRegistry schemas.
 * @returns {string}
 */
export function computeSchemaHash() {
  const entries = Object.entries(ModelRegistry.schemas).sort(([a], [b]) => a.localeCompare(b))
  const source = JSON.stringify(entries.map(([name, s]) => ({ name, hash: s.schemaHash })))
  return simpleHash(source)
}

/**
 * Check whether the schema has changed since last persist.
 * @returns {boolean}
 */
export function shouldNuke() {
  const stored = localStorage.getItem(SCHEMA_HASH_KEY)
  const current = computeSchemaHash()
  return stored !== current
}

/**
 * Build store definitions for all registered models.
 * @returns {Record<string, { keyPath: string, indexes: Array, primaryKey: string }>} store name -> config
 */
export function buildStoreDefinitions() {
  const stores = {}
  for (const [_, schema] of Object.entries(ModelRegistry.schemas)) {
    const pk = schema.primaryKey
    const tableName = schema.tableName
    stores[tableName] = {
      keyPath: pk,
      indexes: schema.indexes ?? [],
      primaryKey: pk,
    }
  }
  return stores
}

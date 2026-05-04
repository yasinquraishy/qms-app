// constants.js

export const DB_NAME = 'syncEngineDB'
export const SCHEMA_HASH_KEY = 'syncEngine_schemaHash'

/** IDB object store for per-model delta-sync watermarks (lastSyncValue). */
export const SYNC_META_STORE = '__syncMeta__'

export const TX_MODE = Object.freeze({
  READONLY: 'readonly',
  READWRITE: 'readwrite',
})

export const LOAD_STRATEGY = Object.freeze({
  LOCAL: 'local', // Only local persistence, no network sync
  INSTANT: 'instant', // Default: sync to network immediately on save
  LAZY: 'lazy', // Sync to network on demand (not implemented yet)
})

export const ID_FIELD = 'id'

export const PROP_TYPE = Object.freeze({
  PROPERTY: 'property',
  REFERENCE: 'reference',
  REFERENCE_MODEL: 'referenceModel',
})

export const CUSTOM_INDEX_TYPE = Object.freeze({
  SINGLE: 'single',
  COMPOUND: 'compound',
})

export const OPERATION = Object.freeze({
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
})

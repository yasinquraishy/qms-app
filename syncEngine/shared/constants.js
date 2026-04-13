// constants.js

export const DB_NAME = 'syncEngineDB'
export const SCHEMA_HASH_KEY = 'syncEngine_schemaHash'

export const TRANSACTIONS_STORE = 'transactions'
export const TABLE_METAS_STORE = 'tableMetas'

export const TX_MODE = Object.freeze({
  READONLY: 'readonly',
  READWRITE: 'readwrite',
})

export const STATUS = Object.freeze({
  PENDING: 'pending',
  SYNCED: 'synced',
})

export const LOAD_STRATEGY = Object.freeze({
  LOCAL: 'local', // Only local persistence, no network sync
  INSTANT: 'instant', // Default: sync to network immediately on save
  LAZY: 'lazy', // Sync to network on demand (not implemented yet)
  // NOTE: "instant" and "lazy" are mentioned in comments but not implemented as enum values.
  // Using undefined loadStrategy defaults to instant (network sync).
  // When adding new strategies, update @ClientModel JSDoc accordingly.
})

export const ID_FIELD = 'id'
export const STATUS_INDEX = 'status'
export const CREATED_AT_INDEX = 'createdAt'

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

export const SW_STATE = Object.freeze({
  IDLE: 'idle',
  BOOTSTRAPPING: 'bootstrapping',
  READY: 'ready',
})

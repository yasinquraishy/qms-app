// hydration.js
import { IndexedDB } from './IndexedDB.js'
import { ObjectPool } from '../core/ObjectPool.js'
import ModelRegistry from '../core/ModelRegistry.js'
import { defaultSerializers } from './defaultSerializers.js'
import { DateTime } from 'luxon'

/**
 * Deep equality check for deserialized model values.
 *
 * Avoids triggering reactive setters when the hydrated value is structurally
 * identical to what the instance already holds. The IDB layer round-trips
 * arrays/objects through JSON.parse(JSON.stringify(...)), so freshly hydrated
 * values always have new references — a shallow check would always say
 * "different" and re-assign on every refresh, which (because Vue's ref triggers
 * watchers asynchronously while `_clearModified()` runs synchronously) produces
 * a save→hydrate→save loop.
 *
 * @param {*} a
 * @param {*} b
 * @returns {boolean}
 */
export function valuesEqual(a, b) {
  if (Object.is(a, b)) return true
  // Luxon DateTime — compare by millisecond value.
  if (a instanceof DateTime && b instanceof DateTime) {
    return a.isValid && b.isValid && a.toMillis() === b.toMillis()
  }
  // Native Date.
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime()
  }
  // Arrays — recursive element-wise compare so arrays of plain objects (e.g.
  // attachments lists) match after a JSON round-trip.
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (!valuesEqual(a[i], b[i])) return false
    }
    return true
  }
  // Plain objects — recursive key-by-key compare. Class instances (DateTime,
  // Date, Map, Set) are handled by their dedicated branches above; if a value
  // reaches here it is treated as a plain object/POJO.
  if (a !== null && b !== null && typeof a === 'object' && typeof b === 'object') {
    if (Array.isArray(a) !== Array.isArray(b)) return false
    const ak = Object.keys(a)
    const bk = Object.keys(b)
    if (ak.length !== bk.length) return false
    for (const k of ak) {
      if (!Object.prototype.hasOwnProperty.call(b, k)) return false
      if (!valuesEqual(a[k], b[k])) return false
    }
    return true
  }
  return false
}

/**
 * Deserialize a value from its stored (raw) form.
 * @param {*} value - raw value from IndexedDB
 * @param {{ type: Function, options: { serializer?: { fromStore: Function } } } | undefined} propertyMeta
 * @returns {*}
 */
export function deserializeValue(value, propertyMeta) {
  if (!propertyMeta) return value

  const { options = {} } = propertyMeta

  // 1. Property-level custom serializer
  if (options.serializer?.fromStore) {
    return options.serializer.fromStore(value)
  }

  // 2. Default serializers (Date, Map, Set)
  const typeName = options.type?.name
  if (typeName && defaultSerializers[typeName]?.fromStore) {
    return defaultSerializers[typeName].fromStore(value)
  }

  // 3. Fallback: return as-is
  return value
}

/**
 * Serialize a value for storage in IndexedDB.
 * @param {*} value - value from model instance
 * @param {{ type: Function, options: { serializer?: { toStore: Function } } } | undefined} propertyMeta
 * @returns {*}
 */
export function serializeValue(value, propertyMeta) {
  if (value === undefined || value === null) return value
  if (!propertyMeta) return value

  const { options = {} } = propertyMeta

  // 1. Property-level custom serializer
  if (options.serializer?.toStore) {
    return options.serializer.toStore(value)
  }

  // 2. Default serializers (Date, Map, Set, DateTime)
  const typeName = options.type?.name
  if (typeName && defaultSerializers[typeName]?.toStore) {
    return defaultSerializers[typeName].toStore(value)
  }

  // 3. Fallback: return as-is
  return value
}

/**
 * Hydrate a single model instance from IndexedDB.
 * @param {string} modelName
 * @param {*} id
 * @param {object} [overrides] - partial field values to apply after hydration
 * @param {object} [rawRecord] - pre-fetched raw record to skip IndexedDB read
 * @returns {Promise<InstanceType<typeof import('../core/BaseModel.js').BaseModel>|null>}
 */
export async function hydrate(modelName, id, overrides = {}, rawRecord = null) {
  const schema = ModelRegistry.getSchema(modelName)
  const pk = schema.primaryKey
  const tableName = ModelRegistry.getTableName(modelName)

  const raw = rawRecord ?? (await IndexedDB.get(tableName, id))
  if (!raw) return null

  const Ctor = ModelRegistry.getConstructor(modelName)
  if (!Ctor) return null

  // Use pk value from record (not the lookup key, which may differ)
  const pkValue = raw[pk]
  const existingInstance = ObjectPool.get(modelName, pkValue)
  let instance = existingInstance ?? new Ctor()

  // Build property metadata lookup map — schema.properties is already a Map
  const propertyMetaMap = schema.properties

  // Apply deserialized fields to the instance.
  //
  // Two skip rules for an existing pooled instance:
  //   1. Skip fields whose deserialized value already equals the current value
  //      (keeps reactive setters quiet and avoids no-op writes).
  //   2. Skip fields that have pending local edits (in `#modified`). A live-
  //      query refresh that arrives between a user edit and the debounced
  //      save would otherwise read stale IDB state and clobber the user's
  //      in-memory change before it reaches the server.
  const dirtyKeys =
    existingInstance && typeof existingInstance.getModifiedProperties === 'function'
      ? new Set(existingInstance.getModifiedProperties())
      : null

  // Track which keys hydrate actually wrote so we can clear ONLY those dirty
  // marks afterwards. Wholesale `_clearModified()` would wipe the pending-edit
  // flags we just preserved via the dirtyKeys skip rule.
  const assignedKeys = []
  for (const [key, value] of Object.entries(raw)) {
    if (key in overrides) continue
    if (dirtyKeys?.has(key)) continue
    const deserialized = deserializeValue(value, propertyMetaMap.get(key))
    if (!existingInstance || !valuesEqual(deserialized, instance[key])) {
      instance[key] = deserialized
      assignedKeys.push(key)
    }
  }

  // Apply any overrides last
  for (const [key, value] of Object.entries(overrides)) {
    instance[key] = value
    assignedKeys.push(key)
  }

  // For a fresh instance, wipe everything (initialization-time setter noise
  // shouldn't leave the instance pre-dirty). For a pooled instance, clear only
  // the keys we actually wrote — leaves any unrelated pending-edit dirty flags
  // intact so the user's debounced save still reflects them.
  if (!existingInstance) {
    instance._clearModified()
  } else if (assignedKeys.length > 0) {
    instance._clearModifiedFields(assignedKeys)
  }

  // Register in the pool using pkValue
  ObjectPool.register(modelName, pkValue, instance)

  return instance
}

/**
 * Serialize a model instance and store it to IndexedDB.
 * Opposite of hydrate - converts model instance to storable values and persists.
 * @param {string} modelName
 * @param {object} instance - model instance
 * @returns {Promise<object>} - the deserialized object that was stored (for reference)
 */
export async function dehydrate(modelName, instance) {
  const schema = ModelRegistry.getSchema(modelName)
  if (!schema) throw new Error(`[dehydrate] Unknown model: ${modelName}`)

  const pk = schema.primaryKey
  const tableName = schema.tableName
  const result = { [pk]: instance[pk] }

  for (const [key, propMeta] of schema.properties) {
    const value = instance[key]
    result[key] = serializeValue(value, propMeta)
  }

  await IndexedDB.put(tableName, result)

  return result
}

/**
 * Serialize a model instance to a plain object WITHOUT writing to IndexedDB.
 * Used by MutationRunner to build GraphQL mutation variables before the API call.
 *
 * @param {string} modelName
 * @param {object} instance - model instance
 * @returns {object} serialized record suitable for network/IDB use
 */
export function serializeModel(modelName, instance) {
  const schema = ModelRegistry.getSchema(modelName)
  if (!schema) throw new Error(`[serializeModel] Unknown model: ${modelName}`)

  const pk = schema.primaryKey
  const result = { [pk]: instance[pk] }

  for (const [key, propMeta] of schema.properties) {
    result[key] = serializeValue(instance[key], propMeta)
  }

  return result
}

/**
 * Hydrate all instances of a model from IndexedDB.
 * @param {string} modelName
 * @returns {Promise<object[]>}
 */
export async function hydrateAll(modelName) {
  const schema = ModelRegistry.getSchema(modelName)
  const pk = schema.primaryKey
  const tableName = ModelRegistry.getTableName(modelName)
  const records = await IndexedDB.getAll(tableName)
  return Promise.all(records.map((r) => hydrate(modelName, r[pk], {}, r)))
}

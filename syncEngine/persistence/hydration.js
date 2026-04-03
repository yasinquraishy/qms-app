// hydration.js
import { IndexedDB } from "./IndexedDB.js";
import { ObjectPool } from "../core/ObjectPool.js";
import ModelRegistry from "../core/ModelRegistry.js";
import { defaultSerializers } from "./defaultSerializers.js";

/**
 * Deserialize a value from its stored (raw) form.
 * @param {*} value - raw value from IndexedDB
 * @param {{ type: Function, options: { serializer?: { fromStore: Function } } } | undefined} propertyMeta
 * @returns {*}
 */
export function deserializeValue(value, propertyMeta) {
  if (!propertyMeta) return value;

  const { type, options = {} } = propertyMeta;

  // 1. Property-level custom serializer
  if (options.serializer?.fromStore) {
    return options.serializer.fromStore(value);
  }

  // 2. Default serializers (Date, Map, Set)
  const typeName = type?.name;
  if (typeName && defaultSerializers[typeName]?.fromStore) {
    return defaultSerializers[typeName].fromStore(value);
  }

  // 3. Fallback: return as-is
  return value;
}

/**
 * Serialize a value for storage in IndexedDB.
 * @param {*} value - value from model instance
 * @param {{ type: Function, options: { serializer?: { toStore: Function } } } | undefined} propertyMeta
 * @returns {*}
 */
export function serializeValue(value, propertyMeta) {
  if (value === undefined || value === null) return value;
  if (!propertyMeta) return value;

  const { type, options = {} } = propertyMeta;

  // 1. Property-level custom serializer
  if (options.serializer?.toStore) {
    return options.serializer.toStore(value);
  }

  // 2. Default serializers (Date, Map, Set)
  const typeName = type?.name;
  if (typeName && defaultSerializers[typeName]?.toStore) {
    return defaultSerializers[typeName].toStore(value);
  }

  // 3. Fallback: return as-is
  return value;
}

/**
 * Hydrate a single model instance from IndexedDB.
 * @param {string} modelName
 * @param {*} id
 * @param {object} [overrides] - partial field values to apply after hydration
 * @param {object} [rawRecord] - pre-fetched raw record to skip IndexedDB read
 * @returns {Promise<object|null>}
 */
export async function hydrate(modelName, id, overrides = {}, rawRecord = null) {
  const schema = ModelRegistry.getSchema(modelName);
  const pk = schema.primaryKey;
  const tableName = ModelRegistry.getTableName(modelName);

  const raw = rawRecord ?? (await IndexedDB.get(tableName, id));
  if (!raw) return null;

  const Ctor = ModelRegistry.getConstructor(modelName);
  if (!Ctor) return null;

  // Use pk value from record (not the lookup key, which may differ)
  const pkValue = raw[pk];
  let instance = ObjectPool.get(modelName, pkValue) ?? new Ctor();

  // Build property metadata lookup map — schema.properties is already a Map
  const propertyMetaMap = schema.properties;

  // Apply deserialized fields to the instance
  for (const [key, value] of Object.entries(raw)) {
    if (key === pk) {
      // Set the instance's primary key field
      if (instance[pk] == null) instance[pk] = pkValue;
    } else if (!(key in overrides)) {
      instance[key] = deserializeValue(value, propertyMetaMap.get(key));
    }
  }

  // Apply any overrides last
  for (const [key, value] of Object.entries(overrides)) {
    instance[key] = value;
  }

  // Clear dirty flags set during hydration
  instance._clearModified();

  // Register in the pool using pkValue
  ObjectPool.register(modelName, pkValue, instance);

  return instance;
}

/**
 * Serialize a model instance and store it to IndexedDB.
 * Opposite of hydrate - converts model instance to storable values and persists.
 * @param {string} modelName
 * @param {object} instance - model instance
 * @returns {Promise<object>} - the deserialized object that was stored (for reference)
 */
export async function dehydrate(modelName, instance) {
  const schema = ModelRegistry.getSchema(modelName);
  if (!schema) throw new Error(`[dehydrate] Unknown model: ${modelName}`);

  const pk = schema.primaryKey;
  const tableName = schema.tableName;
  const result = { [pk]: instance[pk] };

  for (const [key, propMeta] of schema.properties) {
    const value = instance[key];
    result[key] = serializeValue(value, propMeta);
  }

  await IndexedDB.put(tableName, result);

  return result;
}

/**
 * Hydrate all instances of a model from IndexedDB.
 * @param {string} modelName
 * @returns {Promise<object[]>}
 */
export async function hydrateAll(modelName) {
  const schema = ModelRegistry.getSchema(modelName);
  const pk = schema.primaryKey;
  const tableName = ModelRegistry.getTableName(modelName);
  const records = await IndexedDB.getAll(tableName);
  return Promise.all(records.map((r) => hydrate(modelName, r[pk], {}, r)));
}

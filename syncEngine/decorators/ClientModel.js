import ModelRegistry from '../core/ModelRegistry.js'
import { parseCustomIndex } from '../utils/parseCustomIndex.js'
import { LOAD_STRATEGY } from '../shared/constants.js'
import { DateTime } from 'luxon'

/**
 * @ClientModel — class decorator.
 *
 * Registers the class in ModelRegistry after all field/method decorators have
 * collected their metadata into context.metadata._syncProps.
 *
 * @param {string} tableName — the IndexedDB store name (positional, required)
 * @param {Object} [options] — optional overrides
 * @param {string} [options.primaryKey='id'] — primary key field name
 * @param {string} [options.loadStrategy='instant'] — sync strategy ('instant', 'lazy', or 'local')
 * @param {number} [options.schemaVersion=1] — schema version for migration detection
 * @param {string} [options.syncField] — field name to use for sync status tracking
 * @param {string} [options.customIndex] — custom index definition string, e.g. "email" or "[firstName+lastName]"
 *
 * Usage:
 *   @ClientModel("users")                        — table name required
 *   @ClientModel("users", { loadStrategy: LOAD_STRATEGY.LAZY }) — with options
 */
export function ClientModel(tableName, options = {}) {
  if (typeof tableName !== 'string') {
    throw new Error(
      "@ClientModel requires a table name as first argument, e.g., @ClientModel('users')",
    )
  }

  return function (Class, context) {
    const modelName = context.name
    const properties = context.metadata?._syncProps ?? []
    const indexes = options.customIndex ? parseCustomIndex(options.customIndex) : []
    const primaryKey = options.primaryKey ?? 'id'
    const syncField = options.syncField

    if (syncField !== undefined) {
      const prop = properties.find((p) => p.name === syncField)
      if (!prop) {
        throw new Error(
          `@ClientModel("${tableName}"): syncField "${syncField}" does not exist on ${modelName}. ` +
            `It must be decorated with @Property.`,
        )
      }
      const fieldType = prop.options?.type
      if (fieldType !== Number && fieldType !== Date && fieldType !== DateTime) {
        throw new Error(
          `@ClientModel("${tableName}"): syncField "${syncField}" on ${modelName} must have type Number, Date, or DateTime, ` +
            `got ${fieldType?.name ?? fieldType}.`,
        )
      }
    }

    ModelRegistry.register(
      modelName,
      Class,
      properties,
      options.loadStrategy ?? LOAD_STRATEGY.INSTANT,
      options.schemaVersion ?? 1,
      indexes,
      primaryKey,
      syncField,
      tableName,
    )
    return Class
  }
}

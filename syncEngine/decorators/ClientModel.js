import pluralize from "pluralize-esm";
import ModelRegistry from "../core/ModelRegistry.js";
import { parseCustomIndex } from "../utils/parseCustomIndex.js";
import { LOAD_STRATEGY } from "../shared/constants.js";

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
 *
 * Usage:
 *   @ClientModel("users")                        — table name required
 *   @ClientModel("users", { loadStrategy: LOAD_STRATEGY.LAZY }) — with options
 */
export function ClientModel(tableName, options = {}) {
  if (typeof tableName !== "string") {
    throw new Error(
      "@ClientModel requires a table name as first argument, e.g., @ClientModel('users')",
    );
  }

  return function (Class, context) {
    const modelName = context.name;
    const properties = context.metadata?._syncProps ?? [];
    const customIndexStr = Class.customIndex ?? null;
    const indexes = customIndexStr ? parseCustomIndex(customIndexStr) : [];
    const primaryKey = options.primaryKey ?? "id";
    const syncField = options.syncField;

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
    );
    return Class;
  };
}

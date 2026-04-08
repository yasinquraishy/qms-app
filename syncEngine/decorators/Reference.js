import { observabilityHelper } from '../core/observabilityHelper.js'
import { ObjectPool } from '../core/ObjectPool.js'
import { PROP_TYPE } from '../shared/constants.js'

/**
 * @Reference(modelFn, inverseKey, [options]) — foreign-key field decorator.
 *
 * Applied to the "model" side of a relationship (e.g. `assignee`).
 * Internally registers TWO properties on the instance:
 *
 *   `<field>Id`   — the raw foreign key, persisted in IndexedDB, observable
 *                   via observabilityHelper so mutations are tracked.
 *
 *   `<field>`     — a non-persisted getter/setter pair.
 *                   getter: resolves the related instance from ObjectPool.
 *                   setter: writes the related instance's `id` back to `<field>Id`.
 *
 * Options:
 *   nullable {boolean}  — when true, setter accepts null/undefined.
 *   indexed  {boolean}  — signals that an IndexedDB index should be created
 *                         on `<field>Id` (consumed by the persistence layer).
 *   field    {string}   — override the FK field name (default: `<fieldName>Id`).
 *
 * Usage:
 *   @Reference(() => User, { nullable: true, indexed: true })
 *   assignee = null;
 *
 *   @Reference(() => User, { nullable: true, indexed: true, field: 'createdBy' })
 *   creator = null;  // FK stored as `createdBy`, not `creatorId`
 */
export function Reference(modelFn, options = {}) {
  if (typeof modelFn !== 'function') {
    throw new Error('@Reference requires a model function as the first argument')
  }

  return function (_, context) {
    if (context.kind !== 'field') {
      throw new Error('@Reference must be applied to a class field')
    }

    const modelFieldName = context.name
    const idFieldName = options.field ?? `${modelFieldName}Id`
    const Model = modelFn()

    // Register both in metadata for schemaHash (only the id is persisted).
    context.metadata._syncProps ??= []
    context.metadata._syncProps.push(
      { name: idFieldName, type: PROP_TYPE.REFERENCE, options },
      { name: modelFieldName, type: PROP_TYPE.REFERENCE_MODEL, options },
    )

    context.addInitializer(function () {
      const instance = this

      // ── id field — observable, persisted ──────────────────────────────
      observabilityHelper(instance, idFieldName, (inst, fieldName, oldValue) => {
        inst._propertyChanged?.(fieldName, oldValue)
      })

      // ── model accessor — not persisted ────────────────────────────────
      Object.defineProperty(instance, modelFieldName, {
        enumerable: true,
        configurable: true,
        get() {
          const value = instance[idFieldName]
          if (value == null) return null
          // Resolve via ObjectPool — fall back to findByPk if not cached yet.
          const cached = ObjectPool.get(Model.name, value)
          if (cached != null) return cached
          return Model.findByPk(value)
        },
        set(relatedInstance) {
          if (relatedInstance == null) {
            if (!options.nullable) {
              throw new Error(
                `@Reference '${modelFieldName}' cannot be set to null (nullable: false)`,
              )
            }
            instance[idFieldName] = null
          } else {
            instance[idFieldName] = relatedInstance.id
          }
        },
      })
    })
  }
}

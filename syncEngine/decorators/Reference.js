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
 *
 * Usage:
 *   @Reference(() => User, { nullable: true, indexed: true })
 *   assignee = null;
 */
export function Reference(modelFn, options = {}) {
  return function (_, context) {
    if (context.kind !== 'field') {
      throw new Error('@Reference must be applied to a class field')
    }

    const modelFieldName = context.name
    const idFieldName = `${modelFieldName}Id`

    // Register both in metadata for schemaHash (only the id is persisted).
    context.metadata._syncProps ??= []
    context.metadata._syncProps.push(
      { name: idFieldName, type: PROP_TYPE.REFERENCE, options },
      { name: modelFieldName, type: PROP_TYPE.REFERENCE_MODEL, options },
    )

    context.addInitializer(function () {
      const instance = this
      let targetName

      // ── id field — observable, persisted ──────────────────────────────
      observabilityHelper(instance, idFieldName, (inst, fieldName, oldValue) => {
        inst._propertyChanged?.(fieldName, oldValue)
      })

      // ── model accessor — not persisted ────────────────────────────────
      Object.defineProperty(instance, modelFieldName, {
        enumerable: true,
        configurable: true,
        get() {
          // Resolve via ObjectPool — cache the model name to avoid re-calling modelFn() on every access.
          targetName ??= modelFn().name
          return ObjectPool.get(targetName, instance[idFieldName])
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

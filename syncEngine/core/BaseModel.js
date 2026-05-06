import { UpdateTransaction } from './UpdateTransaction.js'
import ModelRegistry from './ModelRegistry.js'
import { ObjectPool } from './ObjectPool.js'
import { hydrate } from '../persistence/hydration.js'
import { QueryBuilder } from '../query/QueryBuilder.js'
import { OPERATION } from '../shared/constants.js'
import { ModelValidator, ValidationError } from './ModelValidator.js'
import { DateTime } from 'luxon'
import { nextTick } from 'vue'

// Re-export for backwards compatibility
export { ValidationError }

/**
 * Base class for all @ClientModel classes
 *
 * Provides:
 *   _propertyChanged(name, oldValue) — called by observabilityHelper on every
 *     setter invocation; records the first old value so the diff is correct.
 *
 *   save() — snapshots modified properties into an UpdateTransaction and
 *     clears the local dirty state.
 *
 *   isDirty() / getModifiedProperties() — introspection helpers.
 *
 *   validateProperties() — validates all @Property fields against their
 *     declared type and required constraint.
 *
 *   _clearModified() — clears the modified state; called by persistence layer
 *     after hydration or save.
 */
export class BaseModel {
  /**
   * Pluggable save strategy — set by SyncEngine.install() to wire persistence.
   * When null, save() uses the default UpdateTransaction path.
   * This replaces monkey-patching of BaseModel.prototype.save (OCP).
   * @type {((instance: BaseModel) => Promise<void>) | null}
   */
  static _saveStrategy = null

  /**
   * @type {boolean|string} paranoid delete mode — if true, delete() will set a "deletedAt" timestamp instead of removing the record.
   * If a string is provided, it will be used as the field name for the timestamp (e.g., "deletedAt").
   * The field must be decorated with @Property({ type: Date }) or @Property({ type: DateTime }).
   * Note: paranoid mode is opt-in and must be explicitly enabled by setting this static property in the model class.
   * Example:
   *   class User extends BaseModel {
   *     static paranoid = true // uses "deletedAt" by default
   *     // or
   *     static paranoid = "deletedAt" // specify custom field name
   *
   *     @Property({ type: Date }) deletedAt = null
   *     // ...
   *   }
   */
  static paranoid = false

  /**
   * Returns a "now" value appropriate for the given type constructor.
   * @param {Function} type — Number, String, Date, or DateTime
   * @returns {*}
   */
  static #nowForType(type) {
    if (type === Number) return Date.now()
    if (type === String) return new Date().toISOString()
    if (type === DateTime) return DateTime.now()
    return new Date()
  }

  /**
   * Set all @Property({ timestamp: true }) fields to their current-time value.
   * Called once during create().
   * @param {BaseModel} instance
   * @param {Object} schema
   */
  static #applyTimestamps(instance, schema) {
    if (!schema?.properties) return
    for (const [name, meta] of schema.properties) {
      if (meta.options?.timestamp) {
        instance[name] = BaseModel.#nowForType(meta.options.type)
      }
    }
  }

  #action = OPERATION.UPDATE
  #modified = {}

  /**
   * Create a new instance of this model class.
   * Sets action to 'create' so save() will queue a create operation.
   * @param {Record<string, unknown>} object — initial property values
   * @returns {InstanceType} — hydrated instance
   */
  static create(object) {
    const modelName = this.name
    const Ctor = ModelRegistry.getConstructor(modelName)
    if (!Ctor) throw new Error(`[BaseModel] Unknown model: ${modelName}`)

    const schema = ModelRegistry.getSchema(modelName)
    const pk = schema.primaryKey

    // Create instance
    const instance = new Ctor()

    // Assign provided properties
    for (const [key, value] of Object.entries(object)) {
      if (value !== undefined) {
        instance[key] = value
      }
    }

    // Set timestamp fields to current time
    BaseModel.#applyTimestamps(instance, schema)

    // Clear dirty state from property assignments — a newly created instance
    // should not appear dirty until a property is explicitly modified.
    instance._clearModified()

    // Mark as create action
    instance.#action = OPERATION.CREATE

    // Register in pool
    ObjectPool.register(modelName, instance[pk], instance)

    return instance
  }

  /**
   * Find a model instance by primary key.
   * @param {*} id - The primary key value
   * @returns {Promise<this|null>} The model instance or null if not found
   */
  static async findByPk(id, { force = false } = {}) {
    const instance = await hydrate(this.name, id)
    if (!force && instance && this.paranoid) {
      const field = typeof this.paranoid === 'string' ? this.paranoid : 'deletedAt'
      if (instance[field] != null) return null
    }
    return instance
  }

  /**
   * Reload this instance's properties from IndexedDB.
   * Can be called externally to re-sync an in-memory instance from the IDB state.
   * @returns {Promise<void>}
   */
  async reload() {
    const modelName = this.constructor.name
    const schema = ModelRegistry.getSchema(modelName)
    const pk = schema.primaryKey
    await hydrate(modelName, this[pk])
  }

  /**
   * Create a QueryBuilder for filtering instances.
   * @param {string} [indexField] — indexed field name (or compound bracket syntax)
   * @param {unknown} [indexValue] — value to look up via the index
   * @param {Object} [options] — additional options
   * @param {boolean} [options.force=false] — force query even if paranoid mode is enabled
   * @returns {QueryBuilder}
   */
  static where(indexField, indexValue, { force = false } = {}) {
    return new QueryBuilder(this.name, indexField, indexValue, force ? false : this.paranoid)
  }

  /**
   * Mark this instance for deletion.
   * Sets action to 'delete' so save() will queue a delete operation.
   * @returns {Promise<void>}
   */
  async delete() {
    const self = toRaw(this)

    const paranoid = this.constructor.paranoid
    if (paranoid) {
      const field = typeof paranoid === 'string' ? paranoid : 'deletedAt'
      const schema = ModelRegistry.getSchema(this.constructor.name)
      const propMeta = schema?.properties?.get(field)
      const fieldType = propMeta?.options?.type

      if (fieldType === DateTime) {
        this[field] = DateTime.now()
      } else if (fieldType === Number) {
        this[field] = Date.now()
      } else {
        // Date or any other type — default to native Date
        this[field] = new Date()
      }
      self.#action = OPERATION.UPDATE
    } else {
      self.#action = OPERATION.DELETE
    }
    await self.save()
  }

  /**
   * Restore a soft-deleted instance by clearing the paranoid field.
   * @returns {Promise<void>}
   */
  async restore() {
    const field =
      typeof this.constructor.paranoid === 'string' ? this.constructor.paranoid : 'deletedAt'
    this[field] = null
    toRaw(this).#action = OPERATION.UPDATE
    await toRaw(this).save()
  }

  /**
   * Permanently delete this instance, bypassing paranoid soft-delete.
   * @returns {Promise<void>}
   */
  async hardDelete() {
    const self = toRaw(this)
    self.#action = OPERATION.DELETE
    await self.save()
  }

  /**
   * Get the current action for this instance.
   * @returns {string}
   */
  get action() {
    return toRaw(this).#action
  }

  /**
   * Called by observabilityHelper whenever a watched field changes.
   * Only records the FIRST old value (before any subsequent mutations).
   * @param {string} name
   * @param {*} oldValue
   */
  _propertyChanged(name, oldValue) {
    const self = toRaw(this)
    if (!(name in self.#modified)) {
      self.#modified[name] = oldValue
    }
  }

  /**
   * Clear the modified state. Called by persistence layer after hydration or save.
   * @internal
   */
  _clearModified() {
    toRaw(this).#modified = {}
  }

  /**
   * Returns true if any @Property field has changed since
   * the last save().
   */
  isDirty() {
    return Object.keys(toRaw(this).#modified).length > 0
  }

  /**
   * Returns a shallow copy of the current dirty-field snapshot.
   */
  getModifiedProperties() {
    return { ...toRaw(this).#modified }
  }

  /**
   * Validates properties, captures changes, and commits the transaction.
   * Delegates to _saveStrategy if set (e.g., by SyncEngine), otherwise
   * uses the default UpdateTransaction path.
   * @returns {Promise<void>}
   */
  async save() {
    const self = toRaw(this)
    await nextTick() // ensure all property changes are flushed to the instance before we read modified properties

    if (!self.isDirty() && self.#action === OPERATION.UPDATE) {
      return // early exit if no changes to save (but still allow create/delete actions)
    }

    // Validate BEFORE applying autoUpdate timestamps — setting timestamps
    // mutates the reactive instance which re-triggers deep watchers.  If
    // validation fails we must not have touched the instance at all,
    // otherwise the watcher fires debouncedSave again → infinite loop.
    ModelValidator.validate(this, this.constructor.name)

    // Apply autoUpdate timestamps before saving.
    // We must synchronously record the old value in #modified BEFORE setting
    // the new value. The observabilityHelper watcher is async, so it won't
    // have fired by the time _saveStrategy calls getModifiedProperties().
    const schema = ModelRegistry.getSchema(this.constructor.name)
    if (schema?.properties) {
      for (const [name, meta] of schema.properties) {
        if (meta.options?.autoUpdate) {
          if (!(name in self.#modified)) {
            self.#modified[name] = self[name]
          }
          self[name] = BaseModel.#nowForType(meta.options.type)
        }
      }
    }

    if (BaseModel._saveStrategy) {
      await BaseModel._saveStrategy(self)
    } else {
      const changes = self.getModifiedProperties()
      const transaction = new UpdateTransaction(self, changes)
      await transaction.commit()
      self._clearModified()
    }

    self.#action = OPERATION.UPDATE
  }
}

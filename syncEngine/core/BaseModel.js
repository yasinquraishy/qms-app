import { UpdateTransaction } from "./UpdateTransaction.js";
import ModelRegistry from "./ModelRegistry.js";
import { ObjectPool } from "./ObjectPool.js";
import { hydrate } from "../persistence/hydration.js";
import { QueryBuilder } from "../query/QueryBuilder.js";
import { OPERATION } from "../shared/constants.js";
import { ModelValidator, ValidationError } from "./ModelValidator.js";

// Re-export for backwards compatibility
export { ValidationError };

/**
 * Base class for all @ClientModel classes.
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
  static _saveStrategy = null;

  #action = OPERATION.UPDATE;
  #modified = {};

  /**
   * Create a new instance of this model class.
   * Sets action to 'create' so save() will queue a create operation.
   * @param {Record<string, unknown>} object — initial property values
   * @returns {InstanceType} — hydrated instance
   */
  static create(object) {
    const modelName = this.name;
    const Ctor = ModelRegistry.getConstructor(modelName);
    if (!Ctor) throw new Error(`[BaseModel] Unknown model: ${modelName}`);

    const schema = ModelRegistry.getSchema(modelName);
    const pk = schema.primaryKey;

    // Create instance
    const instance = new Ctor();

    // Assign provided properties
    for (const [key, value] of Object.entries(object)) {
      instance[key] = value;
    }

    // Ensure pk is set (generate UUID if not provided)
    if (!instance[pk]) {
      instance[pk] = crypto.randomUUID();
    }

    // Clear dirty state from property assignments — a newly created instance
    // should not appear dirty until a property is explicitly modified.
    instance._clearModified();

    // Mark as create action
    instance.#action = OPERATION.CREATE;

    // Register in pool
    ObjectPool.register(modelName, instance[pk], instance);

    return instance;
  }

  /**
   * Find a model instance by primary key.
   * @param {*} id - The primary key value
   * @returns {Promise<this|null>} The model instance or null if not found
   */
  static async findByPk(id) {
    return hydrate(this.name, id);
  }

  /**
   * Reload this instance's properties from IndexedDB.
   * Called by SyncWorkerBridge after the SW broadcasts a SYNC or ROLLBACK
   * notification — the SW has already written the authoritative record to IDB,
   * so this just pulls it back into the live ObjectPool instance.
   * @returns {Promise<void>}
   */
  async reload() {
    const modelName = this.constructor.name;
    const schema = ModelRegistry.getSchema(modelName);
    const pk = schema.primaryKey;
    await hydrate(modelName, this[pk]);
  }

  /**
   * Create a QueryBuilder for filtering instances.
   * @param {Record<string, unknown>} [conditions] — optional initial filter
   * @returns {QueryBuilder}
   */
  static where(conditions) {
    return new QueryBuilder(this.name).where(conditions || {});
  }

  /**
   * Mark this instance for deletion.
   * Sets action to 'delete' so save() will queue a delete operation.
   * @returns {Promise<void>}
   */
  async delete() {
    this.#action = OPERATION.DELETE;
    await this.save();
  }

  /**
   * Get the current action for this instance.
   * @returns {string}
   */
  get action() {
    return this.#action;
  }

  /**
   * Called by observabilityHelper whenever a watched field changes.
   * Only records the FIRST old value (before any subsequent mutations).
   * @param {string} name
   * @param {*} oldValue
   */
  _propertyChanged(name, oldValue) {
    if (!(name in this.#modified)) {
      this.#modified[name] = oldValue;
    }
  }

  /**
   * Clear the modified state. Called by persistence layer after hydration or save.
   * @internal
   */
  _clearModified() {
    this.#modified = {};
  }

  /**
   * Returns true if any @Property or @Reference id field has changed since
   * the last save().
   */
  isDirty() {
    return Object.keys(this.#modified).length > 0;
  }

  /**
   * Returns a shallow copy of the current dirty-field snapshot.
   */
  getModifiedProperties() {
    return { ...this.#modified };
  }

  /**
   * Validates properties, captures changes, and commits the transaction.
   * Delegates to _saveStrategy if set (e.g., by SyncEngine), otherwise
   * uses the default UpdateTransaction path.
   * @returns {Promise<void>}
   */
  async save() {
    this._validateProperties();

    if (BaseModel._saveStrategy) {
      await BaseModel._saveStrategy(this);
    } else {
      const changes = this.getModifiedProperties();
      const transaction = new UpdateTransaction(this, changes);
      await transaction.commit();
      this._clearModified();
    }
  }

  /**
   * Validate all @Property fields against their declared type and required constraint.
   * @throws {ValidationError} if any field fails validation
   */
  _validateProperties() {
    ModelValidator.validate(this, this.constructor.name);
  }
}

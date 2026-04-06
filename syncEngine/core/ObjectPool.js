/**
 * In-memory object pool — resolves model instances by (modelName, id).
 * Used by @Reference getters to hydrate foreign-key relationships.
 */

/** @type {Map<string, Map<*, object>>} */
const pool = new Map();

export const ObjectPool = {
  /**
   * Register an instance so it can be looked up via @Reference.
   * Typically called in the model constructor or after hydration.
   * @param {string} modelName
   * @param {*} id
   * @param {object} instance
   */
  register(modelName, id, instance) {
    if (!pool.has(modelName)) pool.set(modelName, new Map());
    pool.get(modelName).set(id, instance);
  },

  /**
   * Remove a previously registered instance.
   * @param {string} modelName
   * @param {*} id
   */
  unregister(modelName, id) {
    pool.get(modelName)?.delete(id);
  },

  /**
   * Resolve an instance by modelName + id. Returns null if not found.
   * @param {string} modelName
   * @param {*} id
   * @returns {object|null}
   */
  get(modelName, id) {
    if (id == null) return null;
    return pool.get(modelName)?.get(id) ?? null;
  },

  /**
   * Clear the pool (optionally scoped to one model).
   * @param {string} [modelName]
   */
  clear(modelName) {
    if (modelName) pool.delete(modelName);
    else pool.clear();
  },
};

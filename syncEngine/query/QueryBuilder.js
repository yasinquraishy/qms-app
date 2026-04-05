import { IndexedDB } from '../persistence/IndexedDB.js'
import ModelRegistry from '../core/ModelRegistry.js'
import { hydrate } from '../persistence/hydration.js'

/**
 * Chainable query builder for finding model instances.
 *
 * Index condition is set via the constructor; additional in-memory
 * filters are added with `.where(field, value | fn)`.
 *
 * @example
 * const issues = await Issue.where('status', 'open').exec();
 * const first  = await Issue.where('status', 'open').where('priority', v => v > 3).orderBy('createdAt').first();
 * const all    = await Issue.where().where('title', 'foo').exec();
 */
export class QueryBuilder {
  #modelName
  #tableName = null
  #indexName = null
  #indexValue = null
  #conditions = []
  #sortBy = null
  #limit = null
  #offset = 0
  #paranoidField = null

  constructor(modelName, indexField, indexValue, paranoid) {
    this.#modelName = modelName

    if (indexField) {
      this.#indexName = indexField
      this.#indexValue = indexValue
    }

    if (paranoid) {
      this.#paranoidField = typeof paranoid === 'string' ? paranoid : 'deletedAt'
    }
  }

  /**
   * Get the IndexedDB store name for this model's table.
   * @returns {string}
   */
  #getTableName() {
    if (this.#tableName === null) {
      this.#tableName = ModelRegistry.getTableName(this.#modelName)
    }
    return this.#tableName
  }

  /**
   * Add an in-memory filter condition.
   * @param {string} field — field name to match
   * @param {unknown | ((value: unknown) => boolean)} value — equality value or predicate function
   * @returns {this} for chaining
   */
  where(field, value) {
    this.#conditions.push([field, value])
    return this
  }

  /**
   * Sort by a field.
   * @param {string} field — field name to sort by
   * @param {"asc"|"desc"|((a: unknown, b: unknown) => number)} [direction="asc"]
   */
  orderBy(field, direction = 'asc') {
    this.#sortBy = [field, direction]
    return this
  }

  /**
   * Alias for orderBy().
   */
  sortBy(field, direction = 'asc') {
    return this.orderBy(field, direction)
  }

  /**
   * Limit result count.
   * @param {number} n
   */
  limit(n) {
    this.#limit = n
    return this
  }

  /**
   * Skip N results (for pagination).
   * @param {number} n
   */
  offset(n) {
    this.#offset = n
    return this
  }

  /**
   * Execute the query and return all matching instances.
   * @returns {Promise<object[]>}
   */
  async exec() {
    let records = await this.#execute()

    // Apply sorting in-memory
    if (this.#sortBy) {
      records = this.#applySort(records)
    }

    // Apply offset BEFORE hydration to avoid unnecessary work
    if (this.#offset > 0) {
      records = records.slice(this.#offset)
    }

    // Apply limit BEFORE hydration — only hydrate the records we need
    if (this.#limit !== null) {
      records = records.slice(0, this.#limit)
    }

    // Hydrate raw records to model instances (only the sliced subset)
    return this.#hydrateResults(records)
  }

  /**
   * Execute and return the first match.
   * @returns {Promise<object|null>}
   */
  async first() {
    const results = await this.limit(1).exec()
    return results[0] ?? null
  }

  /**
   * Execute and return the last match (after sorting).
   * @returns {Promise<object|null>}
   */
  async last() {
    if (!this.#sortBy) {
      const schema = ModelRegistry.getSchema(this.#modelName)
      this.orderBy(schema.primaryKey, 'desc')
    }
    return this.first()
  }

  // ─── Private helpers ────────────────────────────────────────────

  /**
   * Fetch raw records — indexed lookup or full scan, then filter conditions in-memory.
   * @returns {Promise<Record<string, unknown>[]>}
   */
  async #execute() {
    let records

    if (this.#indexName) {
      records = await IndexedDB.getByIndex(this.#getTableName(), this.#indexName, this.#indexValue)
    } else {
      records = await IndexedDB.getAll(this.#getTableName())
    }

    if (this.#paranoidField) {
      records = records.filter((r) => r[this.#paranoidField] == null)
    }

    for (const [field, test] of this.#conditions) {
      records = records.filter((r) =>
        typeof test === 'function' ? test(r[field]) : r[field] === test,
      )
    }

    return records
  }

  /**
   * Apply in-memory sorting.
   */
  #applySort(records) {
    const [field, direction] = this.#sortBy

    if (typeof direction === 'function') {
      return [...records].sort((a, b) => direction(a[field], b[field]))
    }

    const dir = direction === 'desc' ? -1 : 1
    return [...records].sort((a, b) => {
      const va = a[field]
      const vb = b[field]
      if (va < vb) return -1 * dir
      if (va > vb) return 1 * dir
      return 0
    })
  }

  /**
   * Hydrate raw records to model instances using hydrate().
   */
  async #hydrateResults(records) {
    if (records.length === 0) return []
    const schema = ModelRegistry.getSchema(this.#modelName)
    const pk = schema.primaryKey
    return Promise.all(records.map((r) => hydrate(this.#modelName, r[pk], {}, r)))
  }
}

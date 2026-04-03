import { IndexedDB } from "../persistence/IndexedDB.js";
import ModelRegistry from "../core/ModelRegistry.js";
import { hydrate } from "../persistence/hydration.js";

/**
 * Chainable query builder for finding model instances.
 *
 * @example
 * const issues = await Issue.where({ status: 'open' }).exec();
 * const first = await Issue.where({ priority: 5 }).orderBy('createdAt').first();
 */
export class QueryBuilder {
  #modelName;
  #tableName = null; // cached resolved tableName
  #conditions = {};
  #sortField = null;
  #sortDirection = "asc"; // "asc" | "desc"
  #limit = null;
  #offset = 0;

  constructor(modelName) {
    this.#modelName = modelName;
  }

  /**
   * Get the IndexedDB store name for this model's table.
   * @returns {string}
   */
  #getTableName() {
    if (this.#tableName === null) {
      this.#tableName = ModelRegistry.getTableName(this.#modelName);
    }
    return this.#tableName;
  }

  /**
   * Specify filter conditions (AND logic).
   * @param {Record<string, unknown>} conditions — field/value pairs to match
   * @returns {this} for chaining
   */
  where(conditions) {
    this.#conditions = { ...this.#conditions, ...conditions };
    return this;
  }

  /**
   * Alias for where().
   */
  filter(conditions) {
    return this.where(conditions);
  }

  /**
   * Sort by a field.
   * @param {string} field — field name to sort by
   * @param {"asc"|"desc"} [direction="asc"]
   */
  orderBy(field, direction = "asc") {
    this.#sortField = field;
    this.#sortDirection = direction;
    return this;
  }

  /**
   * Limit result count.
   * @param {number} n
   */
  limit(n) {
    this.#limit = n;
    return this;
  }

  /**
   * Skip N results (for pagination).
   * @param {number} n
   */
  offset(n) {
    this.#offset = n;
    return this;
  }

  /**
   * Execute the query and return all matching instances.
   * @returns {Promise<object[]>}
   */
  async exec() {
    let records = await this.#execute();

    // Apply sorting in-memory
    if (this.#sortField) {
      records = this.#applySort(records);
    }

    // Apply offset BEFORE hydration to avoid unnecessary work
    if (this.#offset > 0) {
      records = records.slice(this.#offset);
    }

    // Apply limit BEFORE hydration — only hydrate the records we need
    if (this.#limit !== null) {
      records = records.slice(0, this.#limit);
    }

    // Hydrate raw records to model instances (only the sliced subset)
    return this.#hydrateResults(records);
  }

  /**
   * Execute and return the first match.
   * @returns {Promise<object|null>}
   */
  async first() {
    const results = await this.limit(1).exec();
    return results[0] ?? null;
  }

  /**
   * Execute and return the last match (after sorting).
   * @returns {Promise<object|null>}
   */
  async last() {
    if (!this.#sortField) {
      // No explicit sort — use primary key descending
      const schema = ModelRegistry.getSchema(this.#modelName);
      this.orderBy(schema.primaryKey, "desc");
    }
    return this.first();
  }

  // ─── Private helpers ────────────────────────────────────────────

  /**
   * Parse compound index key syntax '[field1+field2]' into field names array.
   * @param {string} field - e.g., '[status+priority]' or 'status'
   * @returns {string[]|null} - ['status', 'priority'] or null if not compound
   */
  #parseCompoundKey(field) {
    if (field.startsWith("[") && field.endsWith("]")) {
      const inner = field.slice(1, -1);
      return inner.split("+").map((f) => f.trim());
    }
    return null;
  }

  /**
   * Find compound index matching the given fields.
   * @param {string[]} fields - ['status', 'priority']
   * @param {Array} indexes - schema.indexes array
   * @returns {Object|null} - compound index definition or null
   */
  #findCompoundIndex(fields, indexes) {
    return (
      indexes.find(
        (idx) =>
          idx.type === "compound" &&
          idx.fields.length === fields.length &&
          idx.fields.every((f, i) => f === fields[i]),
      ) ?? null
    );
  }

  /**
   * Determine the best query strategy and fetch raw records.
   * @returns {Promise<Record<string, unknown>[]>}
   */
  async #execute() {
    const schema = ModelRegistry.getSchema(this.#modelName);
    const { indexes } = schema;

    // Separate compound vs simple conditions
    const compoundConds = {}; // { '[status+priority]': { value: ['pending', 1], indexName: 'status+priority' } }
    const singleIndexedConds = {}; // { status: 'open' } - using single indexes
    const nonIndexedConds = {}; // { title: 'foo' } - no index

    for (const [field, value] of Object.entries(this.#conditions)) {
      const compoundFields = this.#parseCompoundKey(field);

      if (compoundFields) {
        const idx = this.#findCompoundIndex(compoundFields, indexes);
        if (idx) {
          compoundConds[field] = { value, indexName: idx.fields.join("+") };
        } else {
          // Compound index not found - treat as non-indexed
          nonIndexedConds[field] = value;
        }
      } else if (this.#isIndexedField(field, indexes)) {
        singleIndexedConds[field] = value;
      } else {
        nonIndexedConds[field] = value;
      }
    }

    // Identify full compound conditions (value array length matches field count)
    const fullCompoundConds = Object.entries(compoundConds).filter(
      ([, { value }]) => Array.isArray(value) && value.length > 0,
    );

    // Strategy 1: Single full compound index query → direct IndexedDB lookup
    if (
      Object.keys(singleIndexedConds).length === 0 &&
      Object.keys(nonIndexedConds).length === 0 &&
      fullCompoundConds.length === 1
    ) {
      const [, { value, indexName }] = fullCompoundConds[0];
      return IndexedDB.getByIndex(this.#getTableName(), indexName, value);
    }

    // Strategy 2: Multiple indexed conditions (single or compound) → use first, filter rest
    if (
      Object.keys(nonIndexedConds).length === 0 &&
      Object.keys(singleIndexedConds).length + fullCompoundConds.length > 1
    ) {
      // Use first indexed condition (prefer compound if available)
      let records;
      if (fullCompoundConds.length > 0) {
        const [, { value, indexName }] = fullCompoundConds[0];
        records = await IndexedDB.getByIndex(
          this.#getTableName(),
          indexName,
          value,
        );
      } else {
        const [[firstField, firstValue]] = Object.entries(singleIndexedConds);
        records = await IndexedDB.getByIndex(
          this.#getTableName(),
          firstField,
          firstValue,
        );
      }
      // Filter remaining single indexed conditions
      for (const [f, v] of Object.entries(singleIndexedConds)) {
        records = records.filter((r) => r[f] === v);
      }
      // Filter remaining compound conditions in-memory
      for (const [field] of fullCompoundConds.slice(1)) {
        const { value } = compoundConds[field];
        const fields = this.#parseCompoundKey(field);
        records = records.filter((r) =>
          fields.every((f, i) => r[f] === value[i]),
        );
      }
      return records;
    }

    // Strategy 3: Has compound conditions + non-indexed conditions
    // Use compound index first, then filter non-indexed in-memory
    if (Object.keys(compoundConds).length > 0) {
      let records;
      if (fullCompoundConds.length > 0) {
        const [, { value, indexName }] = fullCompoundConds[0];
        records = await IndexedDB.getByIndex(
          this.#getTableName(),
          indexName,
          value,
        );
      } else {
        records = await IndexedDB.getAll(this.#getTableName());
      }
      // Filter compound conditions in-memory
      for (const [field, { value }] of Object.entries(compoundConds)) {
        const fields = this.#parseCompoundKey(field);
        records = records.filter((r) =>
          fields.every((f, i) => r[f] === value[i]),
        );
      }
      // Filter non-indexed conditions
      for (const [f, v] of Object.entries(nonIndexedConds)) {
        records = records.filter((r) => r[f] === v);
      }
      return records;
    }

    // Strategy 4: Single indexed condition → use getByIndex
    if (
      Object.keys(nonIndexedConds).length === 0 &&
      Object.keys(singleIndexedConds).length === 1
    ) {
      const [field, value] = Object.entries(singleIndexedConds)[0];
      return IndexedDB.getByIndex(this.#getTableName(), field, value);
    }

    // Strategy 5: Multiple single indexed conditions → use first, filter rest in-memory
    if (
      Object.keys(nonIndexedConds).length === 0 &&
      Object.keys(singleIndexedConds).length > 1
    ) {
      const [[firstField, firstValue], ...rest] =
        Object.entries(singleIndexedConds);
      let records = await IndexedDB.getByIndex(
        this.#getTableName(),
        firstField,
        firstValue,
      );
      for (const [field, value] of rest) {
        records = records.filter((r) => r[field] === value);
      }
      return records;
    }

    // Strategy 6: Has non-indexed conditions → fetch all and filter in-memory
    let records = await IndexedDB.getAll(this.#getTableName());
    for (const [field, value] of Object.entries(this.#conditions)) {
      records = records.filter((r) => r[field] === value);
    }
    return records;
  }

  /**
   * Check if a field has an index defined.
   */
  #isIndexedField(field, indexes) {
    return indexes.some((idx) => idx.type === "single" && idx.field === field);
  }

  /**
   * Apply in-memory sorting.
   */
  #applySort(records) {
    const dir = this.#sortDirection === "desc" ? -1 : 1;
    return [...records].sort((a, b) => {
      const va = a[this.#sortField];
      const vb = b[this.#sortField];
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
  }

  /**
   * Hydrate raw records to model instances using hydrate().
   * Note: hydrate() works on single records by pk; we need to hydrate each.
   */
  async #hydrateResults(records) {
    if (records.length === 0) return [];
    const schema = ModelRegistry.getSchema(this.#modelName);
    const pk = schema.primaryKey;
    return Promise.all(
      records.map((r) => hydrate(this.#modelName, r[pk], {}, r)),
    );
  }
}

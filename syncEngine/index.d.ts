// ─────────────────────────────────────────────────────────────────────────────
// sync-engine — TypeScript definitions
// ─────────────────────────────────────────────────────────────────────────────

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export type LoadStrategy =
  | "instant"
  | "lazy"
  | "partial"
  | "explicitlyRequested"
  | "local";

export type OperationType = "create" | "update" | "delete";

export const OPERATION: {
  readonly CREATE: "create";
  readonly UPDATE: "update";
  readonly DELETE: "delete";
};

export interface Serializer<T = unknown> {
  toStore(value: T): unknown;
  fromStore(raw: unknown): T;
}

export interface PropertyMeta {
  name: string;
  type: "property" | "reference" | "referenceModel";
  options: Record<string, unknown>;
}

export interface SchemaEntry {
  schemaHash: string;
  loadStrategy: LoadStrategy;
  properties: PropertyMeta[];
  primaryKey: string;
  syncField?: string;
  tableName: string;
}

// ---------------------------------------------------------------------------
// ModelRegistry
// ---------------------------------------------------------------------------

export declare const ModelRegistry: {
  modelLookup: Record<string, new (...args: unknown[]) => unknown>;
  schemas: Record<string, SchemaEntry>;

  register(
    name: string,
    constructor: new (...args: unknown[]) => unknown,
    properties: PropertyMeta[],
    loadStrategy?: LoadStrategy,
    schemaVersion?: number,
    indexes?: Array<{ type: string; field?: string; fields?: string[] }>,
    primaryKey?: string,
    syncField?: string,
    tableName?: string,
  ): void;

  getSchema(name: string): SchemaEntry | null;
  getConstructor(name: string): (new (...args: unknown[]) => unknown) | null;
};

// ---------------------------------------------------------------------------
// ObjectPool
// ---------------------------------------------------------------------------

export declare const ObjectPool: {
  /** Register an instance so @Reference getters can resolve it. */
  register(modelName: string, id: unknown, instance: object): void;

  /** Remove a previously registered instance. */
  unregister(modelName: string, id: unknown): void;

  /** Resolve an instance by modelName + id. Returns null if not found. */
  get(modelName: string, id: unknown): object | null;

  /** Clear the pool, optionally scoped to one model. */
  clear(modelName?: string): void;
};

// ---------------------------------------------------------------------------
// UpdateTransaction
// ---------------------------------------------------------------------------

export declare class UpdateTransaction<M extends BaseModel = BaseModel> {
  readonly model: M;
  readonly changes: Partial<Record<string, unknown>>;
  committed: boolean;

  constructor(model: M, changes: Partial<Record<string, unknown>>);

  /** Persist/send the changes. Override for custom transport logic. */
  commit(): this;

  /** Undo changes by restoring old values onto the model. */
  rollback(): this;
}

// ---------------------------------------------------------------------------
// QueryBuilder
// ---------------------------------------------------------------------------

export declare class QueryBuilder<M extends BaseModel = BaseModel> {
  constructor(modelName: string);

  /**
   * Specify filter conditions (AND logic).
   * Supports compound index queries using bracket syntax:
   * where({ '[field1+field2]': [value1, value2] })
   *
   * @example
   * Issue.where({ status: 'open' }).exec()
   * Issue.where({ '[status+priority]': ['pending', 1] }).exec()
   */
  where(conditions: Record<string, unknown>): this;
  filter(conditions: Record<string, unknown>): this;
  orderBy(field: string, direction?: "asc" | "desc"): this;
  limit(n: number): this;
  offset(n: number): this;

  exec(): Promise<M[]>;
  first(): Promise<M | null>;
  last(): Promise<M | null>;
}

// ---------------------------------------------------------------------------
// BaseModel
// ---------------------------------------------------------------------------

export declare class BaseModel {
  /** Returns the current action for this instance. */
  get action(): OperationType;

  /** @internal Called by observabilityHelper on every setter invocation. */
  _propertyChanged(name: string, oldValue: unknown): void;

  /** @internal Clear the modified state. Called by persistence layer after hydration or save. */
  _clearModified(): void;

  /** True if any @Property or @Reference id field has changed since last save(). */
  isDirty(): boolean;

  /** Shallow copy of the current dirty-field snapshot (fieldName → oldValue). */
  getModifiedProperties(): Record<string, unknown>;

  /**
   * Validate properties, capture changes, commit transaction, and return void.
   */
  save(): Promise<void>;

  /**
   * Mark this instance for deletion. Sets action to 'delete' so save() will
   * queue a delete operation.
   */
  delete(): Promise<void>;

  /** Validate all @Property fields against their declared type and required constraint. */
  _validateProperties(): void;

  /**
   * Create a new instance of this model class.
   * Sets action to 'create' so save() will queue a create operation.
   *
   * @param object - Initial property values (partial of the model instance)
   * @returns The created instance, registered in ObjectPool
   *
   * @example
   * const user = User.create({ name: 'John', age: 30 });
   */
  static create<T extends typeof BaseModel>(
    this: T,
    object: Partial<InstanceType<T>>,
  ): InstanceType<T>;

  /**
   * Find a model instance by primary key.
   * @param id - The primary key value
   * @returns Promise resolving to the model instance or null
   */
  static findByPk<T extends typeof BaseModel>(
    this: T,
    id: unknown,
  ): Promise<InstanceType<T> | null>;

  /**
   * Create a QueryBuilder for filtering instances.
   * @param conditions — optional initial filter conditions
   * @returns QueryBuilder typed to the calling class
   *
   * @example
   * Issue.where({ status: 'open' }).exec()  // Promise<Issue[]>
   * Issue.where({ priority: 5 }).first()    // Promise<Issue | null>
   */
  static where<T extends typeof BaseModel>(
    this: T,
    conditions?: Record<string, unknown>,
  ): QueryBuilder<InstanceType<T>>;
}

/**
 * Error thrown when @Property validation fails during validateProperties().
 */
export declare class ValidationError extends Error {
  errors: Array<{ field: string; message: string }>;
  constructor(errors: Array<{ field: string; message: string }>);
}

// ---------------------------------------------------------------------------
// @ClientModel
// ---------------------------------------------------------------------------

export interface ClientModelOptions {
  loadStrategy?: LoadStrategy;
  schemaVersion?: number;
  primaryKey?: string;
  syncField?: string;
  customIndex?: string;
}

/**
 * Class decorator. Registers the class in ModelRegistry once all field/method
 * decorators have collected their metadata.
 *
 * @example
 * @ClientModel("users")
 * class User extends BaseModel { ... }
 *
 * @ClientModel("users", { loadStrategy: "lazy" })
 * class User extends BaseModel { ... }
 */
export declare function ClientModel(
  tableName: string,
  options?: ClientModelOptions,
): ClassDecorator;

// ---------------------------------------------------------------------------
// @Property
// ---------------------------------------------------------------------------

export interface PropertyOptions {
  /** Built-in type constructor (String, Number, Boolean, Date) or custom class constructor. Required. */
  type: new (...args: unknown[]) => unknown;
  /** When true, field value cannot be null/undefined/empty string. Default: false */
  required?: boolean;
  serializer?: Serializer;
}

/**
 * Field decorator for plain owned/scalar fields.
 * Wraps the field in a MobX observable box and tracks mutations for save().
 *
 * @example
 * @Property({ type: String })
 * title = '';
 *
 * @Property({ type: Number })
 * priority = 0;
 *
 * @Property({ type: Date, required: true })
 * createdAt: Date | null = null;
 */
export declare function Property(
  options?: PropertyOptions,
): (target: undefined, context: ClassFieldDecoratorContext) => void;

// ---------------------------------------------------------------------------
// @Reference
// ---------------------------------------------------------------------------

export interface ReferenceOptions {
  /** When true the FK field may be null. */
  nullable?: boolean;
  /** When true an IndexedDB index is created on the FK field. */
  indexed?: boolean;
}

/**
 * Field decorator for foreign-key relationships.
 * Creates two instance members: `<field>Id` (observable FK) and `<field>`
 * (ObjectPool getter/setter).
 *
 * @example
 * @Reference(() => User, 'assignedIssues', { nullable: true, indexed: true })
 * assignee: User | null = null;
 */
export declare function Reference<T extends BaseModel>(
  modelFn: () => new (...args: unknown[]) => T,
  inverseKey: string,
  options?: ReferenceOptions,
): (target: undefined, context: ClassFieldDecoratorContext) => void;

// ---------------------------------------------------------------------------
// @Action
// ---------------------------------------------------------------------------

/**
 * Method decorator. Wraps the method in a MobX action so all observable
 * mutations inside it are batched into a single reaction flush.
 *
 * @example
 * @Action
 * moveToTeam(team: Team) { ... }
 */
export declare function Action(
  target: Function,
  context: ClassMethodDecoratorContext,
): Function;

// ---------------------------------------------------------------------------
// @Computed
// ---------------------------------------------------------------------------

/**
 * Getter decorator. Memoises the accessor using a per-instance MobX computed.
 * The value is never stored in IndexedDB and never generates transactions.
 *
 * @example
 * @Computed
 * get parents(): Issue[] { ... }
 */
export declare function Computed(
  target: Function,
  context: ClassGetterDecoratorContext,
): () => unknown;

// ---------------------------------------------------------------------------
// Persistence layer
// ---------------------------------------------------------------------------

export interface TransactionQueueEntry {
  id: string;
  modelName: string;
  modelId: unknown;
  changes: Record<string, unknown>;
  newValues: Record<string, unknown>;
  action: OperationType;
  status: "pending" | "synced";
  createdAt: number;
}

export declare const TransactionQueue: {
  append(
    modelName: string,
    modelId: unknown,
    changes: Record<string, unknown>,
    newValues: Record<string, unknown>,
    action?: OperationType,
  ): Promise<string>;
  getPending(): Promise<unknown[]>;
  markSynced(id: string): Promise<void>;
  getById(id: string): Promise<TransactionQueueEntry | null>;
};

export declare const IndexedDB: {
  _db: IDBDatabase | null;
  init(dbName?: string): Promise<IDBDatabase>;
  put(
    modelName: string,
    record: Record<string, unknown>,
  ): Promise<Record<string, unknown>>;
  bulkPut(
    modelName: string,
    records: Record<string, unknown>[],
  ): Promise<Record<string, unknown>[]>;
  get(modelName: string, id: unknown): Promise<Record<string, unknown> | null>;
  getAll(modelName: string): Promise<Record<string, unknown>[]>;
  delete(modelName: string, id: unknown): Promise<void>;
  getByIndex(
    modelName: string,
    indexName: string,
    value: unknown,
  ): Promise<Record<string, unknown>[]>;
};

export declare class SyncTransaction<
  M extends BaseModel = BaseModel,
> extends UpdateTransaction<M> {
  get modelName(): string;
  commit(): Promise<this>;
  rollback(): Promise<this>;
}

/**
 * Hydrate a single model instance from IndexedDB.
 * @param modelName - The registered model name
 * @param id - The model instance id
 * @param [overrides] - Partial field values to apply after hydration
 */
export declare function hydrate(
  modelName: string,
  id: unknown,
  overrides?: Record<string, unknown>,
): Promise<BaseModel | null>;

/**
 * Hydrate all instances of a model from IndexedDB.
 * @param modelName - The registered model name
 */
export declare function hydrateAll(modelName: string): Promise<BaseModel[]>;

/**
 * Initialize the persistence layer.
 * Call once at app startup, after all @ClientModel classes are defined.
 * @param options
 * @param options.dbName - IndexedDB database name (default: 'syncEngineDB')
 * @param options.socketUrl - Socket.IO server URL for real-time sync
 * @param options.graphqlUrl - GraphQL server URL for outgoing sync
 * @param options.graphQLWorkerIntervalMs - GraphQL worker poll interval (default: 5000)
 * @param options.graphqlClientOptions - Options passed to createGraphQLClient
 * @returns Promise resolving to the IDBDatabase
 */
export declare function install(options?: {
  dbName?: string;
  socketUrl?: string;
  graphqlUrl?: string;
  graphQLWorkerIntervalMs?: number;
  graphqlClientOptions?: Record<string, unknown>;
}): Promise<IDBDatabase>;

/**
 * Get the Socket.IO socket instance.
 */
export declare function getSocket(): unknown;

/**
 * Disconnect the Socket.IO connection.
 */
export declare function disconnectSocket(): void;

// ---------------------------------------------------------------------------
// GraphQL Network Layer
// ---------------------------------------------------------------------------

export interface GraphQLClient {
  client: unknown;
  request(document: unknown, variables?: Record<string, unknown>): Promise<unknown>;
}

export interface GraphQLClientOptions {
  headers?: Record<string, string>;
  onError?: (error: Error) => void;
}

export declare function createGraphQLClient(
  url: string,
  options?: GraphQLClientOptions,
): GraphQLClient;

export declare class GraphQLWorker {
  constructor(
    client: GraphQLClient,
    options?: {
      intervalMs?: number;
      onError?: (error: Error) => void;
      onFlush?: (entry: unknown) => void;
    },
  );
  start(): void;
  stop(): void;
}


export declare const GraphQLSchemaGenerator: {
  generateUpsertMutation(
    modelName: string,
  ): { mutation: string; variableName: string };
  generateFetchQuery(
    modelName: string,
  ): { query: string; variableName: string };
  generateFetchAllQuery(modelName: string): { query: string };
};

/**
 * Get the Graffle GraphQL client instance.
 */
export declare function getGraphQLClient(): GraphQLClient | null;

/**
 * Get the GraphQL worker instance.
 */
export declare function getGraphQLWorker(): GraphQLWorker | null;


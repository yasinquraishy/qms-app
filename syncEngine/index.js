// Decorators
export { ClientModel } from './decorators/ClientModel.js'
export { Property } from './decorators/Property.js'
export { Reference } from './decorators/Reference.js'
export { Action } from './decorators/Action.js'
export { Computed } from './decorators/Computed.js'

// Core
export { BaseModel } from './core/BaseModel.js'
export { UpdateTransaction } from './core/UpdateTransaction.js'
export { ObjectPool } from './core/ObjectPool.js'
export { default as ModelRegistry } from './core/ModelRegistry.js'
export { ModelValidator, ValidationError } from './core/ModelValidator.js'

// Persistence layer
// Query
export { QueryBuilder } from './query/QueryBuilder.js'

// Persistence layer
export { syncEngine, SyncEngine } from './syncEngine.js'
export { hydrate, hydrateAll } from './persistence/hydration.js'
export { SyncTransaction } from './persistence/SyncTransaction.js'
export { IndexedDB } from './persistence/IndexedDB.js'
export { TransactionQueue } from './persistence/TransactionQueue.js'

// SW infrastructure
export { TableMetaService } from './persistence/TableMetaService.js'
export { SyncWorkerBridge } from './worker/SyncWorkerBridge.js'

// Vue integration
export { syncBus } from './core/syncBus.js'

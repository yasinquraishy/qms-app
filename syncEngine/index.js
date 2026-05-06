// Decorators
export { ClientModel } from './decorators/ClientModel.js'
export { Property } from './decorators/Property.js'
export { Action } from './decorators/Action.js'
export { Computed } from './decorators/Computed.js'

// Core
export { BaseModel } from './core/BaseModel.js'
export { ObjectPool } from './core/ObjectPool.js'
export { default as ModelRegistry } from './core/ModelRegistry.js'
export { ModelValidator, ValidationError } from './core/ModelValidator.js'
export { MetaCache } from './core/MetaCache.js'
export { pendingRequests } from './core/pendingRequests.js'

// Persistence layer
export { QueryBuilder } from './query/QueryBuilder.js'
export { IndexedDB } from './persistence/IndexedDB.js'
export { hydrate, hydrateAll, serializeModel } from './persistence/hydration.js'
export { syncMetaStore } from './persistence/syncMetaStore.js'

// Sync
export { bootstrapAll } from './sync/bootstrap.js'
export { markAsRecentlyWritten } from './sync/socketSubscriber.js'

// Engine
export { syncEngine, SyncEngine } from './syncEngine.js'

// Network
export { graphqlRequest, GraphQLError } from './network/graphqlClient.js'
export { MutationRunner } from './network/MutationRunner.js'

// Vue integration
export { syncBus } from './core/syncBus.js'

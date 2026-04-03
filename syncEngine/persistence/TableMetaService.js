import ModelRegistry from '../core/ModelRegistry.js'
import { GraphQLSchemaGenerator } from '../network/GraphQLSchemaGenerator.js'
import { IndexedDB } from './IndexedDB.js'
import { TABLE_METAS_STORE, LOAD_STRATEGY } from '../shared/constants.js'

export class TableMetaService {
  /**
   * Populate the tableMetas IDB store with pre-generated GraphQL strings
   * for every registered model that participates in network sync.
   *
   * Called once during SyncEngine.install(), after IndexedDB.init().
   * The Service Worker reads these records to flush mutations and handle queries
   * without needing access to ModelRegistry or pluralize.
   */
  static async populateAll() {
    const entries = Object.entries(ModelRegistry.schemas)

    for (const [modelName, schema] of entries) {
      // Skip local-only models (TableMeta, TransactionQueue, and any user LOCAL models)
      if (schema.loadStrategy === LOAD_STRATEGY.LOCAL) continue

      const { singularName, pk } = GraphQLSchemaGenerator._resolveSchema(modelName)
      const mutations = GraphQLSchemaGenerator.generateMutationStrings(modelName)
      const queries = GraphQLSchemaGenerator.generateQueryStrings(modelName)

      // Write directly via IndexedDB.put (bypass save() to avoid SyncTransaction overhead)
      await IndexedDB.put(TABLE_METAS_STORE, {
        tableName: schema.tableName, // PK
        modelName, // indexed — SW looks up by modelName from queue entries
        primaryKey: pk, // e.g. "id"
        syncField: schema.syncField, // e.g. "updatedAt" or "version" (optional) — for sync status tracking
        lastSyncValue: 0, // timestamp or version for last successful sync
        singularName, // e.g. "user" — needed for CREATE variable shape
        createMutation: mutations.create,
        updateMutation: mutations.update,
        deleteMutation: mutations.delete,
        fetchQuery: queries.fetch.query,
        fetchAllQuery: queries.fetchAll.query,
        fetchAllFilterType: queries.fetchAll.filterType,
        fetchVariableName: queries.fetch.variableName,
      })
    }
  }
}

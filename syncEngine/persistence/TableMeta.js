import { ClientModel, Property, BaseModel } from '../index.js'
import { TABLE_METAS_STORE, LOAD_STRATEGY } from '../shared/constants.js'

@ClientModel(TABLE_METAS_STORE, {
  primaryKey: 'tableName',
  loadStrategy: LOAD_STRATEGY.LOCAL,
  customIndex: 'modelName',
})
export class TableMeta extends BaseModel {
  @Property({ type: String }) tableName = '' // PK — "users", "documents"
  @Property({ type: String }) modelName = '' // indexed — "User", "Document"
  @Property({ type: String }) primaryKey = '' // "id"
  @Property({ type: String }) syncField = /** @type {string | undefined} */ (undefined) // "updatedAt" or "version" (optional) — for sync status tracking
  @Property({ type: String }) lastSyncValue = 0 // timestamp or version for last successful sync like "updatedAt" or "version" field
  @Property({ type: String }) singularName = '' // "user", "document"
  @Property({ type: String }) createMutation = '' // full GraphQL mutation string
  @Property({ type: String }) updateMutation = '' // full GraphQL mutation string
  @Property({ type: String }) deleteMutation = '' // full GraphQL mutation string
  @Property({ type: String }) fetchQuery = '' // full GraphQL query string
  @Property({ type: String }) fetchAllQuery = '' // full GraphQL query string — supports $filter, $first, $after
  @Property({ type: String }) fetchAllFilterType = '' // e.g. "UserFilter" — for typed variables
  @Property({ type: String }) fetchVariableName = '' // "id" — for fetch-by-pk variables
}

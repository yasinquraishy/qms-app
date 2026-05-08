/**
 * MutationRunner — builds and fires GraphQL mutations/queries for model operations.
 * Called directly from directSaveStrategy (main thread, no queue).
 */

import { MetaCache } from '../core/MetaCache.js'
import { graphqlRequest } from './graphqlClient.js'
import { serializeModel } from '../persistence/hydration.js'
import { OPERATION, LOAD_STRATEGY } from '../shared/constants.js'
import ModelRegistry from '../core/ModelRegistry.js'

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * Build { query, variables } for the given action.
 * @param {object} meta - MetaCache entry
 * @param {import('../core/BaseModel.js').BaseModel} instance
 * @param {string} action - OPERATION.*
 * @returns {{ query: string, variables: object }}
 */
function buildQueryAndVariables(meta, instance, action) {
  const id = instance[meta.pk]

  switch (action) {
    case OPERATION.CREATE: {
      const serialized = serializeModel(instance.constructor.name, instance, 'create')
      return {
        query: meta.create,
        variables: { input: { [meta.singularName]: serialized } },
      }
    }
    case OPERATION.UPDATE: {
      // Only send the changed fields as patch
      const changedKeys = instance.getModifiedProperties()
      const allValues = serializeModel(instance.constructor.name, instance, 'update')
      const patch = {}
      for (const key of changedKeys) {
        if (key in allValues) patch[key] = allValues[key]
      }
      return {
        query: meta.update,
        variables: { input: { [meta.pk]: id, patch } },
      }
    }
    case OPERATION.DELETE:
      return {
        query: meta.delete,
        variables: { input: { [meta.pk]: id } },
      }
    default:
      throw new Error(`[MutationRunner] Unknown action: ${action}`)
  }
}

/**
 * Extract the server-returned record from a create/update GraphQL response.
 * Returns null for DELETE (no record in response body).
 * @param {object} data - raw GraphQL data object
 * @param {object} meta
 * @param {string} action
 * @returns {object|null}
 */
function extractServerRecord(data, meta, action) {
  if (action === OPERATION.DELETE) return null
  const opName =
    action === OPERATION.CREATE
      ? `create${capitalize(meta.singularName)}`
      : `update${capitalize(meta.singularName)}`
  return data?.[opName]?.[meta.singularName] ?? null
}

export const MutationRunner = {
  /**
   * Run a create/update/delete mutation for a model instance.
   *
   * @param {import('../core/BaseModel.js').BaseModel} instance
   * @param {string} action - OPERATION.CREATE | UPDATE | DELETE
   * @returns {Promise<object|null>} server-returned record (null for DELETE or LOCAL models)
   * @throws {GraphQLError} if the request fails
   */
  async run(instance, action) {
    const modelName = instance.constructor.name
    const schema = ModelRegistry.getSchema(modelName)
    if (!schema) throw new Error(`[MutationRunner] Unknown model: ${modelName}`)

    // LOCAL strategy: no network
    if (schema.loadStrategy === LOAD_STRATEGY.LOCAL) return null

    const meta = MetaCache.get(modelName)
    if (!meta) throw new Error(`[MutationRunner] No meta for model: ${modelName}`)

    const { query, variables } = buildQueryAndVariables(meta, instance, action)
    const data = await graphqlRequest(query, variables)
    return extractServerRecord(data, meta, action)
  },

  /**
   * Fetch a single record from the server by primary key.
   * Used by socketSubscriber to materialise a server-pushed change.
   *
   * @param {object} meta - MetaCache entry
   * @param {string|number} pkValue
   * @param {{ signal?: AbortSignal }} [options]
   * @returns {Promise<object|null>}
   */
  async fetchOne(meta, pkValue, { signal } = {}) {
    const data = await graphqlRequest(meta.fetch, { [meta.fetchVariableName]: pkValue }, { signal })
    return data?.[meta.singularName] ?? null
  },
}

import pluralize from 'pluralize-esm'
import ModelRegistry from '../core/ModelRegistry.js'

/** Capitalize first letter: "user" → "User" */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/** Convert camelCase to UPPER_SNAKE_CASE: "updatedAt" → "UPDATED_AT" */
function camelToUpperSnake(str) {
  return str.replace(/([A-Z])/g, '_$1').toUpperCase()
}

/**
 * Auto-generate PostGraphile v5 compliant GraphQL operations from @ClientModel schemas.
 */
export const GraphQLSchemaGenerator = {
  /**
   * Look up schema helpers shared across generators.
   * @param {string} modelName
   * @returns {{ schema: object, singularName: string, capitalSingular: string, pk: string, fields: string }}
   */
  _resolveSchema(modelName) {
    const schema = ModelRegistry.getSchema(modelName)
    if (!schema) {
      throw new Error(`[GraphQLSchemaGenerator] Unknown model: ${modelName}`)
    }
    const tableName = schema.tableName
    const singularName = pluralize.singular(tableName)
    const capitalSingular = capitalize(singularName)
    const pk = schema.primaryKey
    const fields = [...schema.properties.keys()].join('\n      ')
    return { schema, singularName, capitalSingular, pk, fields }
  },

  /**
   * Generate all mutation strings for a model (strings only, no variables).
   * Used by TableMetaService to pre-compute for Service Worker consumption.
   * @param {string} modelName
   * @returns {{ create: string, update: string, delete: string }}
   */
  generateMutationStrings(modelName) {
    const { singularName, capitalSingular, pk, fields } = this._resolveSchema(modelName)
    const capitalPk = capitalize(pk)

    const create = `mutation Create${capitalSingular}($input: Create${capitalSingular}Input!) {
  create${capitalSingular}(input: $input) {
    ${singularName} {
      ${fields}
    }
  }
}`

    const update = `mutation Update${capitalSingular}By${capitalPk}($input: Update${capitalSingular}By${capitalPk}Input!) {
  update${capitalSingular}By${capitalPk}(input: $input) {
    ${singularName} {
      ${fields}
    }
  }
}`

    const del = `mutation Delete${capitalSingular}By${capitalPk}($input: Delete${capitalSingular}By${capitalPk}Input!) {
  delete${capitalSingular}By${capitalPk}(input: $input) {
    deleted${capitalSingular}${capitalPk}
  }
}`

    return { create, update, delete: del }
  },

  /**
   * Generate all query strings for a model (strings only, no variables).
   * Used by TableMetaService to pre-compute for Service Worker consumption.
   * @param {string} modelName
   * @returns {{ fetch: { query: string, variableName: string }, fetchAll: { query: string } }}
   */
  generateQueryStrings(modelName) {
    const { schema, singularName, capitalSingular, pk, fields } = this._resolveSchema(modelName)
    const capitalPk = capitalize(pk)
    const tableName = schema.tableName
    const pluralName = pluralize(tableName)
    const allFields = [...schema.properties.keys()].join('\n      ')
    const filterType = `${capitalSingular}Filter`
    const orderByType = `${capitalSingular}OrderBy`
    const syncFieldOrderByDesc = schema.syncField
      ? `${camelToUpperSnake(schema.syncField)}_DESC`
      : null

    const fetch = {
      query: `query Fetch${capitalSingular}($${pk}: ID!) {
  ${singularName}By${capitalPk}(${pk}: $${pk}) {
    ${fields}
  }
}`,
      variableName: pk,
    }

    const fetchAll = {
      query: `query FetchAll${capitalSingular}($filter: ${filterType}, $first: Int, $after: Cursor, $orderBy: [${orderByType}!]) {
  ${pluralName}(filter: $filter, first: $first, after: $after, orderBy: $orderBy) {
    nodes {
      ${allFields}
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
  }
}`,
      syncFieldOrderByDesc,
    }

    return { fetch, fetchAll }
  },
}

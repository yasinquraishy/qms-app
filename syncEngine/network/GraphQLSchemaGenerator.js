import pluralize from "pluralize-esm";
import ModelRegistry from "../core/ModelRegistry.js";
import { OPERATION } from "../shared/constants.js";

/** Capitalize first letter: "user" → "User" */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
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
    const schema = ModelRegistry.getSchema(modelName);
    if (!schema) {
      throw new Error(`[GraphQLSchemaGenerator] Unknown model: ${modelName}`);
    }
    const tableName = schema.tableName;
    const singularName = pluralize.singular(tableName);
    const capitalSingular = capitalize(singularName);
    const pk = schema.primaryKey;
    const fields = [...schema.properties.keys()].join("\n      ");
    return { schema, singularName, capitalSingular, pk, fields };
  },

  /**
   * Generate the correct PostGraphile v5 mutation + variables for a TransactionQueue entry.
   * Branches on entry.action (create / update / delete).
   *
   * @param {import('../persistence/TransactionQueue.js').TransactionQueue} entry
   * @returns {{ mutation: string, variables: object }}
   */
  generateMutation(entry) {
    const { action, modelName } = entry;

    switch (action) {
      case OPERATION.CREATE:
        return this._generateCreateMutation(entry);
      case OPERATION.UPDATE:
        return this._generateUpdateMutation(entry);
      case OPERATION.DELETE:
        return this._generateDeleteMutation(entry);
      default:
        throw new Error(`[GraphQLSchemaGenerator] Unknown action: ${action}`);
    }
  },

  /**
   * PostGraphile v5 create mutation.
   * mutation CreateUser($input: CreateUserInput!) { createUser(input: $input) { user { ...fields } } }
   * variables: { input: { user: { ...allFields } } }
   */
  _generateCreateMutation(entry) {
    const { singularName, capitalSingular, fields } = this._resolveSchema(
      entry.modelName,
    );

    const mutation = `mutation Create${capitalSingular}($input: Create${capitalSingular}Input!) {
  create${capitalSingular}(input: $input) {
    ${singularName} {
      ${fields}
    }
  }
}`;

    return {
      mutation,
      variables: {
        input: { [singularName]: entry.newValues },
      },
    };
  },

  /**
   * PostGraphile v5 update-by-pk mutation.
   * mutation UpdateUserById($input: UpdateUserByIdInput!) { updateUserById(input: $input) { user { ...fields } } }
   * variables: { input: { id: "...", patch: { ...changedFields } } }
   */
  _generateUpdateMutation(entry) {
    const { singularName, capitalSingular, pk, fields } = this._resolveSchema(
      entry.modelName,
    );
    const capitalPk = capitalize(pk);

    const mutation = `mutation Update${capitalSingular}By${capitalPk}($input: Update${capitalSingular}By${capitalPk}Input!) {
  update${capitalSingular}By${capitalPk}(input: $input) {
    ${singularName} {
      ${fields}
    }
  }
}`;

    return {
      mutation,
      variables: {
        input: {
          [pk]: entry.modelId,
          patch: entry.patch,
        },
      },
    };
  },

  /**
   * PostGraphile v5 delete-by-pk mutation.
   * mutation DeleteUserById($input: DeleteUserByIdInput!) { deleteUserById(input: $input) { deletedUserId } }
   * variables: { input: { id: "..." } }
   */
  _generateDeleteMutation(entry) {
    const { singularName, capitalSingular, pk } = this._resolveSchema(
      entry.modelName,
    );
    const capitalPk = capitalize(pk);

    const mutation = `mutation Delete${capitalSingular}By${capitalPk}($input: Delete${capitalSingular}By${capitalPk}Input!) {
  delete${capitalSingular}By${capitalPk}(input: $input) {
    deleted${capitalSingular}${capitalPk}
  }
}`;

    return {
      mutation,
      variables: {
        input: { [pk]: entry.modelId },
      },
    };
  },

  /**
   * PostGraphile v5 fetch-by-pk query.
   * @param {string} modelName
   * @returns {{ query: string, variableName: string }}
   */
  generateFetchQuery(modelName) {
    const { singularName, capitalSingular, pk, fields } =
      this._resolveSchema(modelName);
    const capitalPk = capitalize(pk);

    const query = `query Fetch${capitalSingular}($${pk}: ID!) {
  ${singularName}By${capitalPk}(${pk}: $${pk}) {
    ${fields}
  }
}`;

    return {
      query,
      variableName: pk,
    };
  },

  /**
   * PostGraphile v5 fetch-all query.
   * @param {string} modelName
   * @returns {{ query: string }}
   */
  generateFetchAllQuery(modelName) {
    const { schema } = this._resolveSchema(modelName);
    const tableName = schema.tableName;
    const pluralName = pluralize(tableName);
    const fields = [...schema.properties.keys()].join("\n      ");

    const query = `query {
  ${pluralName} {
    nodes {
      ${fields}
    }
  }
}`;

    return { query };
  },

  /**
   * Generate all mutation strings for a model (strings only, no variables).
   * Used by TableMetaService to pre-compute for Service Worker consumption.
   * @param {string} modelName
   * @returns {{ create: string, update: string, delete: string }}
   */
  generateMutationStrings(modelName) {
    const { singularName, capitalSingular, pk, fields } =
      this._resolveSchema(modelName);
    const capitalPk = capitalize(pk);

    const create = `mutation Create${capitalSingular}($input: Create${capitalSingular}Input!) {
  create${capitalSingular}(input: $input) {
    ${singularName} {
      ${fields}
    }
  }
}`;

    const update = `mutation Update${capitalSingular}By${capitalPk}($input: Update${capitalSingular}By${capitalPk}Input!) {
  update${capitalSingular}By${capitalPk}(input: $input) {
    ${singularName} {
      ${fields}
    }
  }
}`;

    const del = `mutation Delete${capitalSingular}By${capitalPk}($input: Delete${capitalSingular}By${capitalPk}Input!) {
  delete${capitalSingular}By${capitalPk}(input: $input) {
    deleted${capitalSingular}${capitalPk}
  }
}`;

    return { create, update, delete: del };
  },

  /**
   * Generate all query strings for a model (strings only, no variables).
   * Used by TableMetaService to pre-compute for Service Worker consumption.
   * @param {string} modelName
   * @returns {{ fetch: { query: string, variableName: string }, fetchAll: { query: string } }}
   */
  generateQueryStrings(modelName) {
    const { schema, singularName, capitalSingular, pk, fields } =
      this._resolveSchema(modelName);
    const capitalPk = capitalize(pk);
    const tableName = schema.tableName;
    const pluralName = pluralize(tableName);
    const allFields = [...schema.properties.keys()].join("\n      ");

    const fetch = {
      query: `query Fetch${capitalSingular}($${pk}: ID!) {
  ${singularName}By${capitalPk}(${pk}: $${pk}) {
    ${fields}
  }
}`,
      variableName: pk,
    };

    const fetchAll = {
      query: `query {
  ${pluralName} {
    nodes {
      ${allFields}
    }
  }
}`,
    };

    return { fetch, fetchAll };
  },
};

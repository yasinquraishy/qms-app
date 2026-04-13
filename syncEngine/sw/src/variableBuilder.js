import { OPERATION } from "../../shared/constants.js";

/**
 * Build { mutation, variables } from a queue entry + tableMeta.
 * @param {object} entry - TransactionQueue entry from IDB
 * @param {object} meta - tableMeta record
 * @returns {{ mutation: string, variables: object }}
 */
export function buildMutationFromEntry(entry, meta) {
  switch (entry.action) {
    case OPERATION.CREATE:
      return {
        mutation: meta.createMutation,
        variables: {
          input: { [meta.singularName]: entry.newValues },
        },
      };
    case OPERATION.UPDATE:
      return {
        mutation: meta.updateMutation,
        variables: {
          input: { [meta.primaryKey]: entry.modelId, patch: entry.patch },
        },
      };
    case OPERATION.DELETE:
      return {
        mutation: meta.deleteMutation,
        variables: {
          input: { [meta.primaryKey]: entry.modelId },
        },
      };
    default:
      throw new Error(`Unknown action: ${entry.action}`);
  }
}

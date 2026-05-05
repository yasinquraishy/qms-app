/**
 * formatGraphqlError — converts a caught save error into a user-displayable string
 * or a ValidationError (for field-level display in useToast).
 *
 * Usage:
 *   try {
 *     await instance.save()
 *   } catch (err) {
 *     toast.error(formatSaveError(err))
 *   }
 */

import { GraphQLError } from '../network/graphqlClient.js'
import { ValidationError } from '../core/ModelValidator.js'

/**
 * Convert a caught error into something useToast.error() can render.
 *
 * - GraphQLError with field list → ValidationError (shows per-field messages)
 * - GraphQLError without fields → plain string message
 * - ValidationError → passed through as-is
 * - Unknown error → error.message or string representation
 *
 * @param {unknown} err
 * @returns {string | ValidationError}
 */
export function formatSaveError(err) {
  if (err instanceof GraphQLError) {
    if (err.fields?.length) {
      return new ValidationError(err.fields.map((field) => ({ field, message: err.message })))
    }
    return err.message ?? 'An unexpected error occurred.'
  }

  if (err instanceof ValidationError) {
    return err
  }

  if (err instanceof Error) {
    return err.message
  }

  return String(err)
}

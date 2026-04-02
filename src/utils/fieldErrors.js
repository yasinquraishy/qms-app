/**
 * Utility functions for handling structured validation errors from the API.
 *
 * The backend returns validation errors in this format:
 * {
 *   error: {
 *     code: 'VALIDATION_ERROR',
 *     message: 'Validation failed',
 *     fields: {
 *       'name': ['Name is required'],
 *       'sections[0].title': ['Section title is required'],
 *       'sections[0].id': ['Invalid section ID format']
 *     }
 *   }
 * }
 *
 * These utilities help extract and format those errors for display in forms.
 */

/**
 * Get all errors for a specific field.
 *
 * @param {object} errors - The errors object from ApiError
 * @param {string} field - The field path (e.g., 'name', 'sections[0].title')
 * @returns {string[]} Array of error messages for that field
 *
 * @example
 *   const errors = { 'name': ['Required'], 'email': ['Invalid format'] }
 *   getFieldErrors(errors, 'name')  // ['Required']
 */
function getFieldErrors(errors, field) {
  if (!errors || !field) return []
  const fieldErrors = errors[field]
  if (!fieldErrors) return []
  return Array.isArray(fieldErrors) ? fieldErrors : [fieldErrors]
}

/**
 * Get the first error message for a field (most common use case).
 *
 * @param {object} errors - The errors object from ApiError
 * @param {string} field - The field path
 * @returns {string|null} First error message or null if no errors
 *
 * @example
 *   const errors = { 'name': ['Required', 'Too short'] }
 *   getFirstFieldError(errors, 'name')  // 'Required'
 */
function getFirstFieldError(errors, field) {
  const fieldErrors = getFieldErrors(errors, field)
  return fieldErrors.length > 0 ? fieldErrors[0] : null
}

/**
 * Check if a field has any errors.
 *
 * @param {object} errors - The errors object from ApiError
 * @param {string} field - The field path
 * @returns {boolean} True if the field has errors
 *
 * @example
 *   hasFieldError(errors, 'name')  // true
 */
function hasFieldError(errors, field) {
  return getFieldErrors(errors, field).length > 0
}

/**
 * Format all errors for a field as a single string.
 *
 * @param {object} errors - The errors object from ApiError
 * @param {string} field - The field path
 * @param {string} [separator=', '] - String to join multiple errors
 * @returns {string} Formatted error string
 *
 * @example
 *   const errors = { 'name': ['Required', 'Too short'] }
 *   formatFieldErrors(errors, 'name')  // 'Required, Too short'
 *   formatFieldErrors(errors, 'name', ' • ')  // 'Required • Too short'
 */
function formatFieldErrors(errors, field, separator = ', ') {
  const fieldErrors = getFieldErrors(errors, field)
  return fieldErrors.join(separator)
}

/**
 * Get errors for an array field at a specific index.
 * Useful for form arrays like sections, items, etc.
 *
 * @param {object} errors - The errors object from ApiError
 * @param {string} arrayField - The base array field name (e.g., 'sections')
 * @param {number} index - Array index
 * @param {string} [subField] - Optional sub-field name (e.g., 'title')
 * @returns {object} Object with all errors for items at that index
 *
 * @example
 *   const errors = {
 *     'sections[0].title': ['Required'],
 *     'sections[0].id': ['Invalid format'],
 *     'sections[1].title': ['Too long']
 *   }
 *   getArrayItemErrors(errors, 'sections', 0)
 *   // { title: ['Required'], id: ['Invalid format'] }
 *
 *   getArrayItemErrors(errors, 'sections', 0, 'title')
 *   // { title: ['Required'] }
 */
function getArrayItemErrors(errors, arrayField, index, subField = null) {
  if (!errors) return {}

  const prefix = `${arrayField}[${index}]`
  const itemErrors = {}

  for (const [field, fieldErrors] of Object.entries(errors)) {
    if (field.startsWith(prefix)) {
      // Extract the sub-field name (e.g., 'sections[0].title' → 'title')
      const subFieldName = field.substring(prefix.length + 1) // +1 for the dot

      // If filtering by subField, only include matching fields
      if (subField && subFieldName !== subField) continue

      itemErrors[subFieldName] = Array.isArray(fieldErrors) ? fieldErrors : [fieldErrors]
    }
  }

  return itemErrors
}

/**
 * Clear a specific field error (useful for reactive error objects).
 *
 * @param {object} errors - The errors object (will be mutated)
 * @param {string} field - The field path to clear
 *
 * @example
 *   const errors = ref({ 'name': ['Required'] })
 *   clearFieldError(errors.value, 'name')
 *   // errors.value is now {}
 */
function clearFieldError(errors, field) {
  if (errors && field in errors) {
    delete errors[field]
  }
}

/**
 * Extract a human-readable summary of all validation errors.
 *
 * @param {object} errors - The errors object from ApiError
 * @param {number} [maxErrors=5] - Maximum number of errors to include
 * @returns {string} Summary string
 *
 * @example
 *   const errors = {
 *     'name': ['Required'],
 *     'email': ['Invalid format'],
 *     'sections[0].title': ['Too short']
 *   }
 *   getErrorSummary(errors)
 *   // 'name: Required\nemail: Invalid format\nsections[0].title: Too short'
 */
function getErrorSummary(errors, maxErrors = 5) {
  if (!errors || Object.keys(errors).length === 0) return ''

  const errorPairs = []
  for (const [field, fieldErrors] of Object.entries(errors)) {
    const errorList = Array.isArray(fieldErrors) ? fieldErrors.join(', ') : fieldErrors
    errorPairs.push(`${field}: ${errorList}`)

    if (errorPairs.length >= maxErrors) break
  }

  const remaining = Object.keys(errors).length - errorPairs.length
  if (remaining > 0) {
    errorPairs.push(`...and ${remaining} more error${remaining > 1 ? 's' : ''}`)
  }

  return errorPairs.join('\n')
}

export {
  getFieldErrors,
  getFirstFieldError,
  hasFieldError,
  formatFieldErrors,
  getArrayItemErrors,
  clearFieldError,
  getErrorSummary,
}

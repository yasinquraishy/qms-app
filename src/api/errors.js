/**
 * Structured API error class.
 *
 * Wraps Axios error responses into a predictable shape that the request
 * wrapper and consuming code can rely on.
 *
 * Properties:
 *   - message    {string}  Human-readable error message
 *   - status     {number}  HTTP status code (0 for network / timeout errors)
 *   - errors     {object}  Validation field errors (422 responses)
 *   - code       {string}  Machine-readable error code
 *   - raw        {Error}   Original Axios error (for debugging)
 */

export class ApiError extends Error {
  /**
   * @param {object} opts
   * @param {string} opts.message
   * @param {number} [opts.status=0]
   * @param {object} [opts.errors={}]
   * @param {string} [opts.code='API_ERROR']
   * @param {Error}  [opts.raw]
   */
  constructor({ message, status = 0, errors = {}, code = 'API_ERROR', raw }) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
    this.code = code
    this.raw = raw
  }

  /** True when the error carries per-field validation messages. */
  get hasValidationErrors() {
    return Object.keys(this.errors).length > 0
  }

  /** True when the error is caused by a network issue (no response). */
  get isNetworkError() {
    return this.code === 'NETWORK_ERROR'
  }

  /** True when the error is a timeout. */
  get isTimeout() {
    return this.code === 'TIMEOUT'
  }

  /** True when the request was cancelled. */
  get isCancelled() {
    return this.code === 'CANCELLED'
  }
}

/**
 * `request()` — the single entry-point for all API calls.
 *
 * ── Why a wrapper? ─────────────────────────────────────────────────────────
 * Raw axios calls scatter loading-state management, notification logic,
 * and error handling across every composable.  This wrapper centralises
 * those cross-cutting concerns while staying completely framework-agnostic.
 *
 * ── Options reference ──────────────────────────────────────────────────────
 * | Option        | Type                  | Default | Description                                      |
 * |---------------|-----------------------|---------|--------------------------------------------------|
 * | method        | string                | 'GET'   | HTTP method                                      |
 * | url           | string                | —       | Endpoint path (relative to `/api`)               |
 * | data          | object                | —       | Request body (POST / PUT / PATCH)                |
 * | params        | object                | —       | URL query parameters                             |
 * | headers       | object                | {}      | Extra headers merged with defaults               |
 * | showSuccess   | string | false        | false   | Success notification message (false = silent)    |
 * | showError     | boolean               | true    | Whether to show error notification                |
 * | loader        | boolean|string|Ref    | false   | Loader key / Vue ref / true = 'global'           |
 * | silent        | boolean               | false   | Suppress ALL side-effects (notifications+loader) |
 * | timeout       | number                | —       | Per-request timeout override (ms)                |
 * | signal        | AbortSignal           | —       | Cancellation signal                              |
 * | onUpload      | (progress) => void    | —       | Upload progress callback                         |
 * | retries       | number                | 0       | Retries on transient failures (5xx / network)    |
 * | retryDelay    | number                | 1000    | Delay in ms between retries (doubled each time)  |
 * | raw           | boolean               | false   | Return full Axios response instead of data only  |
 * | responseType  | string                | 'json'  | Axios responseType ('blob', 'arraybuffer', etc.) |
 *
 * ── Return value ───────────────────────────────────────────────────────────
 * By default, returns `response.data` (the envelope-stripped payload).
 * When `raw: true`, returns the full Axios response object.
 * On error, throws an `ApiError` instance.
 */

import { apiClient } from './client.js'
import { loader } from './loader.js'
import { notify } from './notify.js'
import { ApiError } from './errors.js'

/** Statuses eligible for automatic retry. */
const RETRYABLE_STATUSES = new Set([502, 503, 504])

/**
 * Resolve the loader key from the `loader` option.
 *   true      → 'global'
 *   string    → that string
 *   ref       → null (handled via ref directly)
 *   false     → null
 */
function resolveLoaderKey(opt) {
  if (opt === true) return 'global'
  if (typeof opt === 'string') return opt
  return null
}

/**
 * Check if the value looks like a Vue ref (has `.value` property).
 */
function isRef(val) {
  return val != null && typeof val === 'object' && 'value' in val
}

/**
 * Sleep helper for retry delays.
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Main request wrapper.
 *
 * @param {object} opts  See options table above.
 * @returns {Promise<any>}
 * @throws {ApiError}
 */
async function request({
  method = 'GET',
  url,
  data,
  params,
  headers = {},
  showSuccess = false,
  showError = true,
  loader: loaderOpt = false,
  silent = false,
  timeout,
  signal,
  onUpload,
  retries = 0,
  retryDelay = 1000,
  raw = false,
  responseType = 'json',
} = {}) {
  // ── Silent mode overrides ───────────────────────────────────────────────
  if (silent) {
    showSuccess = false
    showError = false
    loaderOpt = false
  }

  // ── Loader start ────────────────────────────────────────────────────────
  const loaderKey = resolveLoaderKey(loaderOpt)
  const loaderRef = isRef(loaderOpt) ? loaderOpt : null

  if (loaderKey) loader.start(loaderKey)
  if (loaderRef) loaderRef.value = true

  // ── Build axios config ──────────────────────────────────────────────────
  const config = {
    method,
    url,
    headers,
    responseType,
  }

  if (data !== undefined) config.data = data
  if (params) config.params = params
  if (timeout) config.timeout = timeout
  if (signal) config.signal = signal

  if (onUpload) {
    config.onUploadProgress = (progressEvent) => {
      const percent = progressEvent.total
        ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
        : 0
      onUpload({
        loaded: progressEvent.loaded,
        total: progressEvent.total,
        percent,
      })
    }
  }

  // ── Execute with retry logic ────────────────────────────────────────────
  let lastError
  const maxAttempts = 1 + Math.max(0, retries)

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await apiClient(config)

      // ── Success notification ────────────────────────────────────────────
      if (showSuccess) {
        notify('positive', typeof showSuccess === 'string' ? showSuccess : 'Success')
      }

      return raw ? response : response.data
    } catch (err) {
      lastError = err

      // Don't retry cancellations
      if (err instanceof ApiError && err.isCancelled) break

      // Only retry on retryable errors
      const shouldRetry =
        attempt < maxAttempts &&
        (err instanceof ApiError
          ? err.isNetworkError || err.isTimeout || RETRYABLE_STATUSES.has(err.status)
          : true)

      if (shouldRetry) {
        const delay = retryDelay * Math.pow(2, attempt - 1) // exponential backoff
        await sleep(delay)
        continue
      }

      break
    } finally {
      // Stop loader only on the last attempt
      if (attempt === maxAttempts || !lastError) {
        if (loaderKey) loader.stop(loaderKey)
        if (loaderRef) loaderRef.value = false
      }
    }
  }

  // ── Error notification ──────────────────────────────────────────────────
  if (showError && lastError && !(lastError instanceof ApiError && lastError.isCancelled)) {
    const message =
      lastError instanceof ApiError ? lastError.message : 'An unexpected error occurred'
    const extra = {}

    // Pass field errors for validation errors
    if (lastError instanceof ApiError && lastError.hasValidationErrors) {
      extra.fields = lastError.errors
    }

    notify('negative', message, extra)
  }

  throw lastError
}

// ── Convenience shorthands ────────────────────────────────────────────────────

/**
 * GET request.
 * @param {string} url
 * @param {object} [opts]  Merged with { method: 'GET', url }
 */
function get(url, opts = {}) {
  return request({ ...opts, method: 'GET', url })
}

/**
 * POST request.
 * @param {string} url
 * @param {object} [data]
 * @param {object} [opts]
 */
function post(url, data, opts = {}) {
  return request({ ...opts, method: 'POST', url, data })
}

/**
 * PUT request.
 * @param {string} url
 * @param {object} [data]
 * @param {object} [opts]
 */
function put(url, data, opts = {}) {
  return request({ ...opts, method: 'PUT', url, data })
}

/**
 * PATCH request.
 * @param {string} url
 * @param {object} [data]
 * @param {object} [opts]
 */
function patch(url, data, opts = {}) {
  return request({ ...opts, method: 'PATCH', url, data })
}

/**
 * DELETE request.
 * @param {string} url
 * @param {object} [opts]
 */
function del(url, opts = {}) {
  return request({ ...opts, method: 'DELETE', url })
}

/**
 * Upload a file via multipart/form-data.
 *
 * @param {string} url
 * @param {FormData} formData
 * @param {object} [opts]  Supports `onUpload` for progress tracking
 */
function upload(url, formData, opts = {}) {
  return request({
    ...opts,
    method: 'POST',
    url,
    data: formData,
    headers: {
      ...opts.headers,
      'Content-Type': 'multipart/form-data',
    },
  })
}

export { request, get, post, put, patch, del, upload }

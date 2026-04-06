/**
 * Public API — single import point for the entire API layer.
 *
 * @example
 *   import { request, get, post, put, del, upload, loader, eventBus, ApiError } from '@/api'
 */

// ── Core ──────────────────────────────────────────────────────────────────────
export { request, get, post, put, patch, del, upload } from './request.js'
export { apiClient, setCompanyIdGetter } from './client.js'

// ── Errors ────────────────────────────────────────────────────────────────────
export { ApiError } from './errors.js'

// ── Loader ────────────────────────────────────────────────────────────────────
export { loader } from './loader.js'
export { useApiLoader } from './useApiLoader.js'

// ── Notifications ─────────────────────────────────────────────────────────────
export { notify, registerNotifyHandler } from './notify.js'

// ── Event bus ─────────────────────────────────────────────────────────────────
export { eventBus } from './eventBus.js'

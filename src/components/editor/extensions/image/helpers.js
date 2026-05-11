const ALLOWED_MIME = new Set([
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/avif',
])

const MAX_FILE_BYTES = 25 * 1024 * 1024

export function isValidImageFile(file) {
  if (!file) return false
  if (!ALLOWED_MIME.has(file.type)) return false
  if (file.size > MAX_FILE_BYTES) return false
  return true
}

// Block known-dangerous schemes; allow everything else. Original strict
// whitelist (http/https, data:image, leading-slash relative) was rejecting
// legitimate upload URLs (protocol-relative `//cdn…`, `blob:`, signed S3 URLs
// with unusual schemes) and silently dropping `src` to null, which is why
// uploaded images failed to render. Exclusion-based sanitization is the
// pattern used by DOMPurify and most modern HTML sanitizers.
//
// What we still block:
//   - javascript:, vbscript: → XSS via src
//   - file:                  → local-disk read
//   - data:* where the MIME type isn't an image → e.g. data:text/html (XSS)
//
// Everything else (http, https, blob, relative paths, protocol-relative,
// data:image/*) is passed through unchanged.
export function sanitizeImageUrl(url) {
  if (typeof url !== 'string') return null
  const trimmed = url.trim()
  if (!trimmed) return null

  const schemeMatch = trimmed.match(/^([a-z][a-z0-9+.-]*):/i)
  if (schemeMatch) {
    const scheme = schemeMatch[1].toLowerCase()
    if (scheme === 'javascript' || scheme === 'vbscript' || scheme === 'file') {
      return null
    }
    if (scheme === 'data') {
      // Only image-MIME data URLs — never data:text/html or similar.
      if (!/^data:image\/[a-z0-9+.-]+[;,]/i.test(trimmed)) return null
    }
  }

  return trimmed
}

let uid = 0
export function nextUploadId() {
  return `up_${Date.now()}_${++uid}`
}

export const IMAGE_ALIGNMENTS = ['left', 'center', 'right', 'full']

export function normalizeAlignment(value) {
  return IMAGE_ALIGNMENTS.includes(value) ? value : 'center'
}

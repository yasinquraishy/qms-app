/**
 * Public/unauthorized routes that don't require authentication.
 * These routes are exempt from session expiry redirects.
 */
export const PUBLIC_ROUTES = [
  '/signin',
  '/signup',
  '/login',
  '/forgot-password',
  '/reset-password',
  '/accept-invitation',
  '/asset-request',
]

/**
 * Check if a given path is a public route.
 * @param {string} path - The pathname to check
 * @returns {boolean}
 */
export function isPublicRoute(path) {
  return PUBLIC_ROUTES.includes(path)
}

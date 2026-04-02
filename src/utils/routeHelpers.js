import { currentSession } from './currentSession'

/**
 *
 * @param {string} path
 * @returnsx
 */
export function getCompanyPath(path) {
  path = path.startsWith('/') ? path.substring(1) : path
  return `/${currentSession.value?.code}/${path}`
}

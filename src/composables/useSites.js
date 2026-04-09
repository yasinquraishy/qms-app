import { currentSession } from '@/utils/currentSession'
import { put } from '@/api'

const symbol = Symbol('useSites')

function SitesState() {
  // Live query for all sites
  const sites = useLiveQuery(async (db) => db.Site.where().exec(), { initial: [] })

  // Create site mutation
  const createSite = useLiveMutation(async (db, { name, code, address, timezone }) => {
    const companyId = currentSession.value?.companyId || ''
    const site = db.Site.create({
      name,
      code,
      address,
      timezone,
      companyId,
    })
    await site.save()
    return site
  })

  // Update site mutation
  const updateSite = useLiveMutation(async (db, { id, ...updates }) => {
    const site = await db.Site.findByPk(id)
    if (!site) throw new Error('Site not found')
    Object.assign(site, updates)
    await site.save()
    return site
  })

  // Delete site mutation
  const deleteSite = useLiveMutation(async (db, { id }) => {
    const site = await db.Site.findByPk(id)
    if (!site) return
    await site.delete()
  })

  // Check code availability - uses HTTP for suggested code feature
  async function checkCodeAvailability(code, name = '', isNameCheck = false, id = null) {
    try {
      const data = await put(
        '/v1/services/sites/checkcode',
        {
          code,
          name,
          isNameCheck,
          id,
        },
        { showError: false },
      )
      return data
    } catch (err) {
      return { message: 'error', error: err.message }
    }
  }

  return {
    sites,
    createSite,
    updateSite,
    deleteSite,
    checkCodeAvailability,
  }
}

/**
 *
 * @returns {ReturnType<typeof SitesState>}
 */
export function useSites() {
  const state = inject(symbol, null)
  if (!state) {
    return SitesState()
  }
  return state
}

export function provideSites() {
  const state = SitesState()
  provide(symbol, state)
  return state
}

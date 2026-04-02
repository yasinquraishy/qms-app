import { currentCompany } from '@/utils/currentCompany.js'
import { get, post, put, del } from '@/api'

const symbol = Symbol('useSites')

function SitesState() {
  const sites = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Filters
  const filters = ref({
    search: '',
  })

  function buildFilterParams() {
    const companyId = currentCompany.value?.id
    const params = { companyId }

    Object.keys(filters.value).forEach((key) => {
      const value = filters.value[key]
      if (value && typeof value === 'string' && value.trim() !== '') {
        params[key] = value.trim()
      }
    })

    return params
  }

  // Fetch sites
  async function fetchSites() {
    const companyId = currentCompany.value?.id

    if (!companyId) {
      error.value = 'Company ID is required'
      return
    }

    error.value = null

    const data = await get('/v1/services/sites', {
      params: buildFilterParams(),
      loader: loading,
    })
    sites.value = data.sites || []
  }

  // Create site
  async function createSite(siteData) {
    const companyId = currentCompany.value?.id
    if (!companyId) return { error: 'Company ID is required' }

    const data = await post('/v1/services/sites', {
      ...siteData,
      companyId,
    })

    await fetchSites()
    return { site: data.site }
  }

  // Delete site
  async function deleteSite(id) {
    const companyId = currentCompany.value?.id
    if (!companyId) return { error: 'Company ID is required' }

    await del(`/v1/services/sites/${id}`, {
      params: { companyId },
    })

    await fetchSites()
    return { success: true }
  }

  // Update site
  async function updateSite(id, siteData) {
    const companyId = currentCompany.value?.id
    if (!companyId) return { error: 'Company ID is required' }
    if (!id) return { error: 'Site ID is required' }

    const data = await put(`/v1/services/sites/${id}`, siteData, {
      params: { companyId },
    })

    await fetchSites()
    return { site: data.site }
  }

  // Check code availability
  async function checkCodeAvailability(code, name = '', isNameCheck = false, id = null) {
    const companyId = currentCompany.value?.id
    if (!companyId) return { error: 'Company ID is required' }

    try {
      const data = await put('/v1/services/sites/checkcode', {
        companyId,
        code,
        name,
        isNameCheck,
        id,
      }, { showError: false })

      return data
    } catch (err) {
      return { message: 'error', error: err.message }
    }
  }

  // Watch filters and refetch
  watch(
    filters,
    () => {
      fetchSites()
    },
    { deep: true },
  )

  // Fetch sites when company changes
  watch(
    () => currentCompany.value?.id,
    (newId) => {
      if (newId) {
        fetchSites()
      }
    },
    { immediate: true },
  )

  return {
    sites,
    loading,
    error,
    filters,
    fetchSites,
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

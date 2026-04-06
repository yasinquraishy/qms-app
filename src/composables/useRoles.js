import { currentCompany } from '@/utils/currentCompany.js'
import { get, post, put } from '@/api'

const symbol = Symbol('useRoles')

function RolesState() {
  const roles = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Filters
  const filters = ref({
    search: '',
    statusId: 'ACTIVE', // Default to active roles
  })

  function buildFilterParams() {
    const companyId = currentCompany.value?.id
    const params = { companyId }

    Object.keys(filters.value).forEach((key) => {
      const value = filters.value[key]
      if (value !== null && value !== '' && typeof value === 'string' && value.trim() !== '') {
        params[key] = value.trim()
      } else if (
        value !== null &&
        value !== '' &&
        typeof value !== 'string' &&
        (Array.isArray(value) ? value.length > 0 : true)
      ) {
        params[key] = value
      }
    })

    return params
  }

  // Fetch roles
  async function fetchRoles() {
    const companyId = currentCompany.value?.id

    if (!companyId) {
      error.value = 'Company ID is required'
      return
    }

    error.value = null

    const data = await get('/v1/services/roles', {
      params: buildFilterParams(),
      loader: loading,
    })
    roles.value = data.roles || []
  }

  // Watch filters and refetch
  watch(
    filters,
    () => {
      fetchRoles()
    },
    { deep: true },
  )

  // Fetch roles when company changes
  watch(
    () => currentCompany.value?.id,
    (newId) => {
      if (newId) {
        fetchRoles()
      }
    },
    { immediate: true },
  )

  // Fetch single role
  async function fetchRole(id) {
    const companyId = currentCompany.value?.id

    if (!companyId) {
      error.value = 'Company ID is required'
      return null
    }

    error.value = null

    const data = await get(`/v1/services/roles/${id}`, {
      params: { companyId },
      loader: loading,
    })
    return data.role
  }

  // Update role
  async function updateRole(id, payload) {
    const companyId = currentCompany.value?.id

    if (!companyId) {
      error.value = 'Company ID is required'
      return { success: false, error: 'Company ID is required' }
    }

    error.value = null

    await put(`/v1/services/roles/${id}`, payload, {
      params: { companyId },
      loader: loading,
    })

    const result = await fetchRole(id)

    // Update role in the roles array
    const roleIndex = roles.value.findIndex((r) => r.id === id)
    if (roleIndex !== -1) {
      roles.value[roleIndex] = result
    }

    return { success: true, role: result }
  }

  // Create role
  async function createRole(payload) {
    const companyId = currentCompany.value?.id

    if (!companyId) {
      error.value = 'Company ID is required'
      return { success: false, error: 'Company ID is required' }
    }

    error.value = null

    const result = await post('/v1/services/roles', payload, {
      params: { companyId },
      loader: loading,
    })
    await fetchRoles()
    return { success: true, role: result.role }
  }

  // Deactivate role
  async function deactivateRole(id) {
    const companyId = currentCompany.value?.id

    if (!companyId) {
      error.value = 'Company ID is required'
      return false
    }

    error.value = null

    await put(
      `/v1/services/roles/${id}`,
      { statusId: 'INACTIVE' },
      {
        params: { companyId },
        loader: loading,
      },
    )

    const roleIndex = roles.value.findIndex((r) => r.id === id)
    if (roleIndex !== -1) {
      roles.value[roleIndex] = { ...roles.value[roleIndex], statusId: 'INACTIVE' }
    }

    return true
  }

  // Activate role
  async function activateRole(id) {
    const companyId = currentCompany.value?.id

    if (!companyId) {
      error.value = 'Company ID is required'
      return false
    }

    error.value = null

    await put(
      `/v1/services/roles/${id}`,
      { statusId: 'ACTIVE' },
      {
        params: { companyId },
        loader: loading,
      },
    )

    const roleIndex = roles.value.findIndex((r) => r.id === id)
    if (roleIndex !== -1) {
      roles.value[roleIndex] = { ...roles.value[roleIndex], statusId: 'ACTIVE' }
    }

    return true
  }

  return {
    roles,
    loading,
    error,
    filters,
    fetchRoles,
    fetchRole,
    updateRole,
    createRole,
    deactivateRole,
    activateRole,
  }
}

/**
 *
 * @returns {ReturnType<typeof RolesState>}
 */
export function useRoles() {
  const state = inject(symbol, null)
  if (!state) {
    return RolesState()
  }
  return state
}

export function provideRoles() {
  const state = RolesState()
  provide(symbol, state)
  return state
}

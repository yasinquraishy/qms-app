import { currentCompany } from '@/utils/currentCompany.js'
import { get, post, put } from '@/api'

const symbol = Symbol('useUsers')

function UsersState() {
  const users = ref([])
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

  // Fetch users
  async function fetchUsers() {
    const companyId = currentCompany.value?.id

    if (!companyId) {
      error.value = 'Company ID is required'
      return
    }

    error.value = null

    const data = await get('/v1/services/users', {
      params: buildFilterParams(),
      loader: loading,
    })
    users.value = data.users || []
  }

  // Create user
  async function createUser(userData) {
    const companyId = currentCompany.value?.id
    if (!companyId) return { error: 'Company ID is required' }

    const data = await post('/v1/services/users', {
      ...userData,
      companyId,
    })

    await fetchUsers()
    return { user: data.user }
  }

  // Get single user
  async function getUser(id) {
    const companyId = currentCompany.value?.id
    if (!companyId) return { error: 'Company ID is required' }

    const data = await get(`/v1/services/users/${id}`, {
      params: { companyId },
      loader: loading,
    })
    return { user: data.user }
  }

  // Update user
  async function updateUser(id, userData) {
    const companyId = currentCompany.value?.id
    if (!companyId) return { error: 'Company ID is required' }

    const data = await put(`/v1/services/users/${id}`, userData, {
      params: { companyId },
    })

    return { user: data.user }
  }

  async function inviteUser(id) {
    const companyId = currentCompany.value?.id
    if (!companyId) return { error: 'Company ID is required' }

    const data = await post(
      `/v1/services/users/${id}/invite`,
      {},
      {
        params: { companyId },
      },
    )

    return { message: data.message }
  }

  // Watch filters and refetch
  watch(
    filters,
    () => {
      fetchUsers()
    },
    { deep: true },
  )

  // Fetch users when company changes
  watch(
    () => currentCompany.value?.id,
    (newId) => {
      if (newId) {
        fetchUsers()
      }
    },
    { immediate: true },
  )

  return {
    users,
    loading,
    error,
    filters,
    fetchUsers,
    createUser,
    getUser,
    updateUser,
    inviteUser,
  }
}

/**
 *
 * @returns {ReturnType<typeof UsersState>}
 */
export function useUsers() {
  const state = inject(symbol, null)
  if (!state) {
    return UsersState()
  }
  return state
}

export function provideUsers() {
  const state = UsersState()
  provide(symbol, state)
  return state
}

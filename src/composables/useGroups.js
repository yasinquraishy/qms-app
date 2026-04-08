import { currentCompany } from '@/utils/currentCompany.js'
import { get, post, put, del } from '@/api'

const symbol = Symbol('useGroups')

function GroupsState() {
  const groups = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Filters
  const filters = ref({
    search: '',
  })

  function buildFilterParams() {
    const params = {}

    Object.keys(filters.value).forEach((key) => {
      const value = filters.value[key]
      if (value && typeof value === 'string' && value.trim() !== '') {
        params[key] = value.trim()
      }
    })

    return params
  }

  // Fetch groups
  async function fetchGroups() {
    error.value = null

    const data = await get('/v1/services/teams', {
      params: buildFilterParams(),
      loader: loading,
    })
    groups.value = data.teams || []
  }

  // Create group
  async function createGroup(groupData) {
    const data = await post(
      '/v1/services/teams',
      {
        ...groupData,
      },
      {
        loader: loading,
      },
    )

    await fetchGroups()
    return { group: data.team }
  }

  // Get single group
  async function getGroup(id) {
    error.value = null

    const data = await get(`/v1/services/teams/${id}`, {
      loader: loading,
    })
    return { group: data.team }
  }

  // Update group
  async function updateGroup(id, groupData) {
    const data = await put(`/v1/services/teams/${id}`, groupData, {
      loader: loading,
    })
    return { group: data.team }
  }

  // Delete group
  async function deleteGroup(id) {
    await del(`/v1/services/teams/${id}`, {
      loader: loading,
    })

    await fetchGroups()
    return { success: true }
  }

  // Watch filters and refetch
  watch(
    filters,
    () => {
      fetchGroups()
    },
    { deep: true },
  )

  // Fetch groups when company changes
  watch(
    () => currentCompany.value?.id,
    (newId) => {
      if (newId) {
        fetchGroups()
      }
    },
    { immediate: true },
  )

  return {
    groups,
    loading,
    error,
    filters,
    fetchGroups,
    createGroup,
    getGroup,
    updateGroup,
    deleteGroup,
  }
}

/**
 *
 * @returns {ReturnType<typeof GroupsState>}
 */
export function useGroups() {
  const state = inject(symbol, null)
  if (!state) {
    return GroupsState()
  }
  return state
}

export function provideGroups() {
  const state = GroupsState()
  provide(symbol, state)
  return state
}

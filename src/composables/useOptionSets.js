import { currentCompany } from '@/utils/currentCompany.js'
import { get, post, put, del } from '@/api'

const symbol = Symbol('useOptionSets')

function OptionSetsState() {
  const optionSets = ref([])
  const currentOptionSet = ref(null)
  const loading = ref(false)

  // Filters
  const filters = ref({
    search: '',
  })

  /**
   * Fetch all option sets for the company
   */
  async function fetchOptionSets() {
    const companyId = currentCompany.value?.id
    if (!companyId) return

    const params = { companyId }

    if (filters.value.search) {
      params.search = filters.value.search
    }

    const data = await get('/v1/services/optionSets', {
      params,
      loader: loading,
    })
    optionSets.value = data.optionSets || []
  }

  /**
   * Fetch a single option set by ID
   */
  async function fetchOptionSet(id) {
    currentOptionSet.value = null
    const companyId = currentCompany.value?.id
    if (!companyId) return null

    const data = await get(`/v1/services/optionSets/${id}`, {
      params: { companyId },
      loader: loading,
    })
    currentOptionSet.value = data.optionSet
    return data.optionSet
  }

  /**
   * Create a new option set
   */
  async function createOptionSet(payload) {
    const companyId = currentCompany.value?.id
    if (!companyId) return { error: 'Company ID is required' }

    const data = await post('/v1/services/optionSets', {
      ...payload,
      companyId,
    }, {
      loader: loading,
      showSuccess: 'Option set created successfully',
    })

    const newOptionSet = data.optionSet
    optionSets.value.push(newOptionSet)
    return newOptionSet
  }

  /**
   * Update an option set
   */
  async function updateOptionSet(id, payload) {
    const companyId = currentCompany.value?.id
    if (!companyId) return { error: 'Company ID is required' }

    const data = await put(`/v1/services/optionSets/${id}`, {
      ...payload,
      companyId,
    }, {
      loader: loading,
      showSuccess: 'Option set updated successfully',
    })

    const updatedOptionSet = data.optionSet

    // Update current ref if matching
    if (currentOptionSet.value && currentOptionSet.value.id === id) {
      currentOptionSet.value = updatedOptionSet
    }

    // Update in list
    const index = optionSets.value.findIndex((os) => os.id === id)
    if (index !== -1) {
      optionSets.value[index] = updatedOptionSet
    }

    return updatedOptionSet
  }

  /**
   * Delete an option set
   */
  async function deleteOptionSet(id) {
    const companyId = currentCompany.value?.id
    if (!companyId) return { error: 'Company ID is required' }

    await del(`/v1/services/optionSets/${id}`, {
      params: { companyId },
      loader: loading,
      showSuccess: 'Option set deleted successfully',
    })

    // Remove from list
    optionSets.value = optionSets.value.filter((os) => os.id !== id)

    // Clear current if matching
    if (currentOptionSet.value && currentOptionSet.value.id === id) {
      currentOptionSet.value = null
    }

    return true
  }

  // Watch filters and refetch
  watch(
    filters,
    () => {
      fetchOptionSets()
    },
    { deep: true },
  )

  // Fetch templates when company changes
  watch(
    () => currentCompany.value?.id,
    (newId) => {
      if (newId) {
        fetchOptionSets()
      }
    },
    { immediate: true },
  )

  return {
    optionSets,
    currentOptionSet,
    loading,
    filters,
    fetchOptionSets,
    fetchOptionSet,
    createOptionSet,
    updateOptionSet,
    deleteOptionSet,
  }
}

/**
 *
 * @returns {ReturnType<typeof OptionSetsState>}
 */
export function useOptionSets() {
  const state = inject(symbol, null)
  if (!state) {
    return OptionSetsState()
  }
  return state
}

export function provideOptionSets() {
  const state = OptionSetsState()
  provide(symbol, state)
  return state
}

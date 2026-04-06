import { currentCompany } from '@/utils/currentCompany.js'
import { get, post, put, del } from '@/api'

const symbol = Symbol('useRecords')

function RecordsState() {
  const records = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Filters
  const filters = ref({
    search: '',
    templateId: undefined,
  })

  function buildFilterParams() {
    const companyId = currentCompany.value?.id
    const params = { companyId }

    Object.entries(filters.value).forEach(([key, value]) => {
      if (value !== null && value !== '' && value !== undefined) {
        params[key] = value
      }
    })

    return params
  }

  // Fetch records
  async function fetchRecords() {
    const companyId = currentCompany.value?.id

    if (!companyId) {
      error.value = 'Company ID is required'
      return
    }

    error.value = null

    const data = await get('/v1/services/records', {
      params: buildFilterParams(),
      loader: loading,
    })
    records.value = data.records || []
  }

  // Delete record
  async function deleteRecord(id) {
    const companyId = currentCompany.value?.id
    if (!companyId) return { error: 'Company ID is required' }

    await del(`/v1/services/records/${id}`, {
      params: { companyId },
      loader: loading,
    })

    await fetchRecords()
    return { success: true }
  }

  // Create record
  async function createRecord(templateId, payload) {
    const companyId = currentCompany.value?.id
    if (!companyId) return { error: 'Company ID is required' }

    const data = await post('/v1/services/records', { templateId, payload }, {
      params: { companyId },
      loader: loading,
    })

    await fetchRecords()
    return { success: true, record: data.record }
  }

  // Update record
  async function updateRecord(id, updates) {
    const companyId = currentCompany.value?.id
    if (!companyId) return { error: 'Company ID is required' }

    const data = await put(`/v1/services/records/${id}`, updates, {
      params: { companyId },
      loader: loading,
    })

    await fetchRecords()
    return { success: true, record: data.record }
  }

  // Watch filters and refetch
  watch(
    filters,
    () => {
      fetchRecords()
    },
    { deep: true },
  )

  // Fetch records when company changes
  watch(
    () => currentCompany.value?.id,
    (newId) => {
      if (newId) {
        fetchRecords()
      }
    },
    { immediate: true },
  )

  return {
    records,
    loading,
    error,
    filters,
    fetchRecords,
    deleteRecord,
    createRecord,
    updateRecord,
  }
}

/**
 *
 * @returns {ReturnType<typeof RecordsState>}
 */
export function useRecords() {
  const state = inject(symbol)
  if (!state) {
    return RecordsState()
  }
  return state
}

export function provideRecords() {
  const state = RecordsState()
  provide(symbol, state)
  return state
}

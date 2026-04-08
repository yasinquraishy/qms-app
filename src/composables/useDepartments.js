import { currentCompany } from '@/utils/currentCompany.js'
import { get, post, put, del } from '@/api'

const symbol = Symbol('useDepartments')

function DepartmentsState() {
  const departments = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Filters
  const filters = ref({
    search: '',
    siteId: null,
  })

  function buildFilterParams() {
    const params = {}

    Object.keys(filters.value).forEach((key) => {
      const value = filters.value[key]
      if (value && typeof value === 'string' && value.trim() !== '') {
        params[key] = value.trim()
      } else if (value && typeof value === 'string' && key === 'siteId') {
        params[key] = value
      }
    })

    return params
  }

  // Fetch departments
  async function fetchDepartments() {
    error.value = null

    const data = await get('/v1/services/departments', {
      params: buildFilterParams(),
      loader: loading,
    })
    departments.value = data.departments || []
  }

  // Create department
  async function createDepartment(departmentData) {
    const data = await post('/v1/services/departments', {
      ...departmentData,
    })

    await fetchDepartments()
    return { department: data.department }
  }

  // Delete department
  async function deleteDepartment(id) {
    await del(`/v1/services/departments/${id}`, {})

    await fetchDepartments()
    return { success: true }
  }

  // Update department
  async function updateDepartment(id, departmentData) {
    if (!id) return { error: 'Department ID is required' }

    const data = await put(`/v1/services/departments/${id}`, departmentData, {})

    await fetchDepartments()
    return { department: data.department }
  }

  // Check code availability
  async function checkCodeAvailability(code, name = '', isNameCheck = false, id = null) {
    try {
      const data = await put(
        '/v1/services/departments/checkcode',
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

  // Watch filters and refetch
  watch(
    filters,
    () => {
      fetchDepartments()
    },
    { deep: true },
  )

  // Fetch departments when company changes
  watch(
    () => currentCompany.value?.id,
    (newId) => {
      if (newId) {
        fetchDepartments()
      }
    },
    { immediate: true },
  )

  return {
    departments,
    loading,
    error,
    filters,
    fetchDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    checkCodeAvailability,
  }
}

/**
 *
 * @returns {ReturnType<typeof DepartmentsState>}
 */
export function useDepartments() {
  const state = inject(symbol, null)
  if (!state) {
    return DepartmentsState()
  }
  return state
}

export function provideDepartments() {
  const state = DepartmentsState()
  provide(symbol, state)
  return state
}

import { currentCompany } from '@/utils/currentCompany.js'
import { get, post, put, del } from '@/api'

const symbol = Symbol('useSuppliers')

function SuppliersState() {
  const suppliers = ref([])
  const loading = ref(false)
  const error = ref(null)

  const filters = ref({
    search: '',
    statusId: null,
    category: null,
    riskLevel: null,
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

  async function fetchSuppliers() {
    error.value = null

    const data = await get('/v1/services/suppliers', {
      params: buildFilterParams(),
      loader: loading,
    })
    suppliers.value = data.suppliers || []
  }

  async function createSupplier(supplierData) {
    const data = await post('/v1/services/suppliers', {
      ...supplierData,
    })

    await fetchSuppliers()
    return { supplier: data.supplier }
  }

  async function updateSupplier(id, supplierData) {
    if (!id) return { error: 'Supplier ID is required' }

    const data = await put(`/v1/services/suppliers/${id}`, supplierData, {})

    await fetchSuppliers()
    return { supplier: data.supplier }
  }

  async function deleteSupplier(id) {
    await del(`/v1/services/suppliers/${id}`, {})

    await fetchSuppliers()
    return { success: true }
  }

  async function getSupplier(id) {
    const data = await get(`/v1/services/suppliers/${id}`, {})

    return { supplier: data.supplier }
  }

  async function checkCodeAvailability(code, name = '', isNameCheck = false, id = null) {
    try {
      const data = await put(
        '/v1/services/suppliers/checkcode',
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

  watch(
    filters,
    () => {
      fetchSuppliers()
    },
    { deep: true },
  )

  watch(
    () => currentCompany.value?.id,
    (newId) => {
      if (newId) {
        fetchSuppliers()
      }
    },
    { immediate: true },
  )

  return {
    suppliers,
    loading,
    error,
    filters,
    fetchSuppliers,
    getSupplier,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    checkCodeAvailability,
  }
}

/**
 *
 * @returns {ReturnType<typeof SuppliersState>}
 */
export function useSuppliers() {
  const state = inject(symbol, null)
  if (!state) {
    return SuppliersState()
  }
  return state
}

export function provideSuppliers() {
  const state = SuppliersState()
  provide(symbol, state)
  return state
}

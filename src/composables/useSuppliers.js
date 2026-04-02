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

  async function fetchSuppliers() {
    const companyId = currentCompany.value?.id

    if (!companyId) {
      error.value = 'Company ID is required'
      return
    }

    error.value = null

    const data = await get('/v1/services/suppliers', {
      params: buildFilterParams(),
      loader: loading,
    })
    suppliers.value = data.suppliers || []
  }

  async function createSupplier(supplierData) {
    const companyId = currentCompany.value?.id
    if (!companyId) return { error: 'Company ID is required' }

    const data = await post('/v1/services/suppliers', {
      ...supplierData,
      companyId,
    })

    await fetchSuppliers()
    return { supplier: data.supplier }
  }

  async function updateSupplier(id, supplierData) {
    const companyId = currentCompany.value?.id
    if (!companyId) return { error: 'Company ID is required' }
    if (!id) return { error: 'Supplier ID is required' }

    const data = await put(`/v1/services/suppliers/${id}`, supplierData, {
      params: { companyId },
    })

    await fetchSuppliers()
    return { supplier: data.supplier }
  }

  async function deleteSupplier(id) {
    const companyId = currentCompany.value?.id
    if (!companyId) return { error: 'Company ID is required' }

    await del(`/v1/services/suppliers/${id}`, {
      params: { companyId },
    })

    await fetchSuppliers()
    return { success: true }
  }

  async function getSupplier(id) {
    const companyId = currentCompany.value?.id
    if (!companyId) return { error: 'Company ID is required' }

    const data = await get(`/v1/services/suppliers/${id}`, {
      params: { companyId },
    })

    return { supplier: data.supplier }
  }

  async function checkCodeAvailability(code, name = '', isNameCheck = false, id = null) {
    const companyId = currentCompany.value?.id
    if (!companyId) return { error: 'Company ID is required' }

    try {
      const data = await put(
        '/v1/services/suppliers/checkcode',
        {
          companyId,
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

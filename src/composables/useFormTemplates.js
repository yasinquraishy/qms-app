import { currentCompany } from '@/utils/currentCompany.js'
import { get, put, del } from '@/api'

const symbol = Symbol('useFormTemplates')

function FormTemplatesState() {
  const templates = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Records for a specific template
  const templateRecords = ref([])
  const recordsLoading = ref(false)

  // Filters
  const filters = ref({
    search: '',
    documentTypeId: null,
    siteId: null,
    code: '',
    stateId: 'ACTIVE',
    statusId: null,
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

  // Fetch form templates
  async function fetchTemplates() {
    const companyId = currentCompany.value?.id

    if (!companyId) {
      error.value = 'Company ID is required'
      return
    }

    error.value = null

    const data = await get('/v1/services/formTemplates', {
      params: buildFilterParams(),
      loader: loading,
    })
    templates.value = data.formTemplates || []
  }

  // Watch filters and refetch
  watch(
    filters,
    () => {
      fetchTemplates()
    },
    { deep: true },
  )

  // Fetch templates when company changes
  watch(
    () => currentCompany.value?.id,
    (newId) => {
      if (newId) {
        fetchTemplates()
      }
    },
    { immediate: true },
  )

  // Update form template
  async function updateTemplate(id, payload) {
    const companyId = currentCompany.value?.id

    if (!companyId) {
      error.value = 'Company ID is required'
      return
    }

    error.value = null

    await put(`/v1/services/formTemplates/${id}`, payload, {
      params: { companyId },
      loader: loading,
    })
    await fetchTemplates()
    return true
  }

  // Delete form template
  async function deleteTemplate(id) {
    const companyId = currentCompany.value?.id

    if (!companyId) {
      error.value = 'Company ID is required'
      return
    }

    error.value = null

    await del(`/v1/services/formTemplates/${id}`, {
      params: { companyId },
      loader: loading,
    })
    await fetchTemplates()
    return true
  }

  // Update a record's payload
  async function updateRecord(recordId, payload) {
    const companyId = currentCompany.value?.id

    if (!companyId) {
      error.value = 'Company ID is required'
      return false
    }

    const result = await put(`/v1/services/records/${recordId}`, payload, {
      params: { companyId },
    })

    // Update the record in local state
    const index = templateRecords.value.findIndex((r) => r.id === recordId)
    if (index !== -1) {
      templateRecords.value[index] = {
        ...templateRecords.value[index],
        ...result.record,
      }
    }

    return true
  }

  // Fetch records for a specific template
  async function fetchTemplateRecords(templateId) {
    const companyId = currentCompany.value?.id

    if (!companyId) {
      error.value = 'Company ID is required'
      return
    }

    if (!templateId) return

    error.value = null

    const data = await get(`/v1/services/formTemplates/${templateId}/records`, {
      params: { companyId },
      loader: recordsLoading,
    })
    templateRecords.value = data.records || []
  }

  return {
    templates,
    loading,
    error,
    filters,
    fetchTemplates,
    updateTemplate,
    deleteTemplate,
    templateRecords,
    recordsLoading,
    fetchTemplateRecords,
    updateRecord,
  }
}

/**
 *
 * @returns {ReturnType<typeof FormTemplatesState>}
 */
export function useFormTemplates() {
  const state = inject(symbol, null)
  if (!state) {
    return FormTemplatesState()
  }
  return state
}

export function provideFormTemplates() {
  const state = FormTemplatesState()
  provide(symbol, state)
  return state
}

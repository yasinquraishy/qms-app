import { currentCompany } from '@/utils/currentCompany.js'
import { get, post, put, del } from '@/api'

const symbol = Symbol('useApprovalWorkflows')

function ApprovalWorkflowsState() {
  const workflows = ref([])
  const currentWorkflow = ref(null)
  const statuses = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Filters
  const filters = ref({
    search: '',
    statusId: null,
  })

  // Fetch approval workflows
  async function fetchWorkflows() {
    const companyId = currentCompany.value?.id

    if (!companyId) {
      console.error('Company ID is required')
      error.value = 'Company ID is required'
      return
    }

    error.value = null

    try {
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

      const data = await get('/v1/services/approvalWorkflows', {
        params,
        loader: loading,
      })
      workflows.value = data.approvalWorkflows || []
    } catch (err) {
      console.error('Error fetching approval workflows:', err)
      error.value = err.message || 'Failed to fetch approval workflows'
      workflows.value = []
    }
  }

  // Fetch single workflow by ID
  async function fetchWorkflow(id) {
    const companyId = currentCompany.value?.id

    if (!companyId) {
      console.error('Company ID is required')
      error.value = 'Company ID is required'
      return null
    }

    error.value = null

    try {
      const data = await get(`/v1/services/approvalWorkflows/${id}`, {
        params: { companyId },
        loader: loading,
      })
      currentWorkflow.value = data.approvalWorkflow || null
      return currentWorkflow.value
    } catch (err) {
      console.error('Error fetching approval workflow:', err)
      error.value = err.message || 'Failed to fetch approval workflow'
      currentWorkflow.value = null
      return null
    }
  }

  // Create new workflow
  async function createWorkflow(payload) {
    const companyId = currentCompany.value?.id

    if (!companyId) {
      console.error('Company ID is required')
      return { error: 'Company ID is required' }
    }

    error.value = null

    try {
      const data = await post(
        '/v1/services/approvalWorkflows',
        { ...payload, companyId },
        { loader: loading },
      )

      await fetchWorkflows()
      return { workflow: data.approvalWorkflow }
    } catch (err) {
      console.error('Error creating approval workflow:', err)
      error.value = err.message
      return { error: err.message }
    }
  }

  // Update workflow metadata (name, description, moduleId, documentTypeId)
  async function updateWorkflow(id, payload) {
    const companyId = currentCompany.value?.id

    if (!companyId) {
      console.error('Company ID is required')
      return false
    }

    error.value = null

    try {
      const data = await put(`/v1/services/approvalWorkflows/${id}`, payload, {
        params: { companyId },
        loader: loading,
      })

      currentWorkflow.value = data.approvalWorkflow
      await fetchWorkflows()
      return true
    } catch (err) {
      console.error('Error updating approval workflow:', err)
      error.value = err.message || 'Failed to update approval workflow'
      return false
    }
  }

  // Update a specific DRAFT version (steps, statusId)
  async function updateWorkflowVersion(workflowId, versionId, payload) {
    const companyId = currentCompany.value?.id
    if (!companyId) return { error: 'Company ID is required' }

    try {
      const data = await put(
        `/v1/services/approvalWorkflows/${workflowId}/versions/${versionId}`,
        payload,
        { params: { companyId }, loader: loading },
      )
      return { version: data.version }
    } catch (err) {
      console.error('Error updating approval workflow version:', err)
      return { error: err.message || 'Failed to update workflow version' }
    }
  }

  // Create a new DRAFT version (copies steps from latest)
  async function createDraftVersion(workflowId, payload = {}) {
    const companyId = currentCompany.value?.id
    if (!companyId) return { error: 'Company ID is required' }

    try {
      const data = await post(`/v1/services/approvalWorkflows/${workflowId}/versions`, payload, {
        params: { companyId },
        loader: loading,
      })
      return { version: data.version }
    } catch (err) {
      console.error('Error creating draft version:', err)
      return { error: err.message || 'Failed to create draft version' }
    }
  }

  // Delete workflow (soft delete)
  async function deleteWorkflow(id) {
    const companyId = currentCompany.value?.id

    if (!companyId) {
      console.error('Company ID is required')
      return false
    }

    error.value = null

    try {
      await del(`/v1/services/approvalWorkflows/${id}`, {
        params: { companyId },
        loader: loading,
      })

      await fetchWorkflows()
      return true
    } catch (err) {
      console.error('Error deleting approval workflow:', err)
      error.value = err.message || 'Failed to delete approval workflow'
      return false
    }
  }

  // Fetch statuses
  async function fetchStatuses() {
    try {
      const data = await get('/v1/services/approvalWorkflowStatuses', {
        showError: false,
      })
      statuses.value = data.approvalWorkflowStatuses || []
    } catch (err) {
      console.error('Error fetching approval workflow statuses:', err)
      statuses.value = []
    }
  }

  // ── Versions ──────────────────────────────────────────────────────────────

  // Fetch all versions for a workflow
  async function fetchVersions(workflowId) {
    const companyId = currentCompany.value?.id
    if (!companyId) return { error: 'Company ID is required' }

    try {
      const data = await get(`/v1/services/approvalWorkflows/${workflowId}/versions`, {
        params: { companyId },
      })
      return { versions: data.versions || [] }
    } catch (err) {
      console.error('Error fetching workflow versions:', err)
      return { error: err.message }
    }
  }

  // Fetch a specific version with full steps
  async function fetchVersion(workflowId, versionId) {
    const companyId = currentCompany.value?.id
    if (!companyId) return { error: 'Company ID is required' }

    try {
      const data = await get(
        `/v1/services/approvalWorkflows/${workflowId}/versions/${versionId}`,
        { params: { companyId } },
      )
      return { version: data.version || null }
    } catch (err) {
      console.error('Error fetching workflow version:', err)
      return { error: err.message }
    }
  }

  // Fetch a version by ID only (no workflowId needed)
  async function fetchVersionById(versionId) {
    const companyId = currentCompany.value?.id
    if (!companyId) return { error: 'Company ID is required' }

    try {
      const data = await get(`/v1/services/approvalWorkflowVersions/${versionId}`, {
        params: { companyId },
      })
      return { version: data.version || null }
    } catch (err) {
      console.error('Error fetching workflow version by ID:', err)
      return { error: err.message }
    }
  }

  // Watch filters and refetch
  watch(filters, () => fetchWorkflows(), { deep: true })

  // Fetch when company changes
  watch(
    () => currentCompany.value?.id,
    (newId) => {
      if (newId) {
        fetchWorkflows()
      }
    },
    { immediate: true },
  )

  return {
    workflows,
    currentWorkflow,
    statuses,
    loading,
    error,
    filters,
    fetchWorkflows,
    fetchWorkflow,
    createWorkflow,
    updateWorkflow,
    updateWorkflowVersion,
    createDraftVersion,
    deleteWorkflow,
    fetchStatuses,
    fetchVersions,
    fetchVersion,
    fetchVersionById,
  }
}

/**
 * @returns {ReturnType<typeof ApprovalWorkflowsState>}
 */
function useApprovalWorkflows() {
  const state = inject(symbol, null)
  if (!state) {
    return ApprovalWorkflowsState()
  }
  return state
}

function provideApprovalWorkflows() {
  const state = ApprovalWorkflowsState()
  provide(symbol, state)
  return state
}

export { useApprovalWorkflows, provideApprovalWorkflows }

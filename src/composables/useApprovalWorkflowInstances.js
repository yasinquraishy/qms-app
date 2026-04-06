import { currentCompany } from '@/utils/currentCompany.js'
import { get, post } from '@/api'

const symbol = Symbol('useApprovalWorkflowInstances')

function ApprovalWorkflowInstancesState() {
  const loading = ref(false)
  const actionLoading = ref(false)
  const error = ref(null)

  const instances = ref([])
  const filters = ref({ search: '', statusId: null })

  async function fetchInstances() {
    const companyId = currentCompany.value?.id
    if (!companyId) return

    error.value = null

    const params = { companyId }
    if (filters.value.search) params.search = filters.value.search
    if (filters.value.statusId) params.statusId = filters.value.statusId

    const data = await get('/v1/services/workflowInstances', { params, loader: loading })
    instances.value = data.workflowInstances || []
  }

  watch(filters, () => fetchInstances(), { deep: true })

  async function fetchInstance(instanceId, options = {}) {
    const companyId = currentCompany.value?.id
    if (!companyId) return { error: 'Company ID is required' }

    error.value = null

    const params = { companyId }
    if (options.includeReviewers) params.includeReviewers = true

    const data = await get(`/v1/services/workflowInstances/${instanceId}`, {
      params,
      loader: loading,
    })
    return { workflowInstance: data.workflowInstance }
  }

  async function updateWorkflowStep(instanceId, action, payload = {}) {
    const companyId = currentCompany.value?.id
    if (!companyId) return { error: 'Company ID is required' }

    const data = await post(`/v1/services/workflowInstances/${instanceId}/${action}`, payload, {
      params: { companyId },
      loader: actionLoading,
    })
    return { workflowInstance: data.workflowInstance }
  }

  async function fetchInstanceAuditLogs(documentId) {
    const companyId = currentCompany.value?.id
    if (!companyId) return { error: 'Company ID is required' }

    const data = await get(`/v1/services/documents/${documentId}/auditLogs`, {
      params: { companyId },
    })
    return { auditLogs: data.auditLogs || [] }
  }

  return {
    loading,
    actionLoading,
    error,
    instances,
    filters,
    fetchInstances,
    fetchInstance,
    updateWorkflowStep,
    fetchInstanceAuditLogs,
  }
}

export function provideApprovalWorkflowInstances() {
  const state = ApprovalWorkflowInstancesState()
  provide(symbol, state)
  return state
}

export function useApprovalWorkflowInstances() {
  return inject(symbol, ApprovalWorkflowInstancesState())
}

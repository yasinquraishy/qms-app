import { get, post } from '@/api'

const symbol = Symbol('useApprovalWorkflowInstances')

function ApprovalWorkflowInstancesState() {
  const loading = ref(false)
  const actionLoading = ref(false)
  const error = ref(null)

  const instances = ref([])
  const filters = ref({ search: '', statusId: null })

  async function fetchInstances() {
    error.value = null

    const params = {}
    if (filters.value.search) params.search = filters.value.search
    if (filters.value.statusId) params.statusId = filters.value.statusId

    const data = await get('/v1/services/workflowInstances', { params, loader: loading })
    instances.value = data.workflowInstances || []
  }

  watch(filters, () => fetchInstances(), { deep: true })

  async function fetchInstance(instanceId, options = {}) {
    error.value = null

    const params = {}
    if (options.includeReviewers) params.includeReviewers = true

    const data = await get(`/v1/services/workflowInstances/${instanceId}`, {
      params,
      loader: loading,
    })
    return { workflowInstance: data.workflowInstance }
  }

  async function updateWorkflowStep(instanceId, action, payload = {}) {
    const data = await post(`/v1/services/workflowInstances/${instanceId}/${action}`, payload, {
      loader: actionLoading,
    })
    return { workflowInstance: data.workflowInstance }
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

import { get, post } from '@/api'

const symbol = Symbol('useTaskInstances')

function TaskInstancesState() {
  const loading = ref(false)
  const actionLoading = ref(false)
  const error = ref(null)

  const taskInstances = ref([])
  const filters = ref({ search: '', statusId: null })

  async function fetchTaskInstances() {
    error.value = null

    const params = {}
    if (filters.value.search) params.search = filters.value.search
    if (filters.value.statusId) params.statusId = filters.value.statusId

    const data = await get('/v1/services/taskInstances', { params, loader: loading })
    taskInstances.value = data.taskInstances || []
  }

  watch(filters, () => fetchTaskInstances(), { deep: true })

  async function fetchInstance(instanceId) {
    error.value = null

    const data = await get(`/v1/services/taskInstances/${instanceId}`, {
      loader: loading,
    })
    return { taskInstance: data.taskInstance }
  }

  async function updateWorkflowStep(instanceId, action, payload = {}) {
    const data = await post(`/v1/services/taskInstances/${instanceId}/${action}`, payload, {
      loader: actionLoading,
    })
    return { taskInstance: data.workflowInstance }
  }

  return {
    loading,
    actionLoading,
    error,
    taskInstances,
    filters,
    fetchTaskInstances,
    fetchInstance,
    updateWorkflowStep,
  }
}

export function provideTaskInstances() {
  const state = TaskInstancesState()
  provide(symbol, state)
  return state
}

export function useTaskInstances() {
  return inject(symbol, TaskInstancesState())
}

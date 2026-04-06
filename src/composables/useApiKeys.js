import { currentCompany } from '@/utils/currentCompany.js'
import { get, post, put, del } from '@/api'

const symbol = Symbol('useApiKeys')

function ApiKeysState() {
  const apiKeys = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchApiKeys() {
    const companyId = currentCompany.value?.id

    if (!companyId) {
      error.value = 'Company ID is required'
      return
    }

    error.value = null

    const data = await get('/v1/services/api-keys', {
      params: { companyId },
      loader: loading,
    })
    apiKeys.value = data.apiKeys || []
  }

  async function createApiKey(payload) {
    const companyId = currentCompany.value?.id
    if (!companyId) return { error: 'Company ID is required' }

    const data = await post('/v1/services/api-keys', {
      ...payload,
      companyId,
    })

    await fetchApiKeys()
    return data
  }

  async function revokeApiKey(id) {
    const companyId = currentCompany.value?.id
    if (!companyId) return { error: 'Company ID is required' }

    await put(
      `/v1/services/api-keys/${id}/revoke`,
      {},
      {
        params: { companyId },
      },
    )

    await fetchApiKeys()
    return { success: true }
  }

  async function deleteApiKey(id) {
    const companyId = currentCompany.value?.id
    if (!companyId) return { error: 'Company ID is required' }

    await del(`/v1/services/api-keys/${id}`, {
      params: { companyId },
    })

    await fetchApiKeys()
    return { success: true }
  }

  watch(
    () => currentCompany.value?.id,
    (newId) => {
      if (newId) {
        fetchApiKeys()
      }
    },
    { immediate: true },
  )

  return {
    apiKeys,
    loading,
    error,
    fetchApiKeys,
    createApiKey,
    revokeApiKey,
    deleteApiKey,
  }
}

/**
 * @returns {ReturnType<typeof ApiKeysState>}
 */
export function useApiKeys() {
  const state = inject(symbol, null)
  if (!state) {
    return ApiKeysState()
  }
  return state
}

export function provideApiKeys() {
  const state = ApiKeysState()
  provide(symbol, state)
  return state
}

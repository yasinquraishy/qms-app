import { currentCompany } from '@/utils/currentCompany.js'
import { get } from '@/api'

const symbol = Symbol('useAuditLogs')

function AuditLogsState() {
  const loading = ref(false)
  const auditLogs = ref([])
  const grouped = ref({})
  const total = ref(0)
  const filters = ref({ entityType: null })

  async function fetchAuditLogs() {
    const companyId = currentCompany.value?.id
    if (!companyId) return

    const params = { companyId, limit: 200 }
    if (filters.value.entityType) params.entityType = filters.value.entityType

    const data = await get('/v1/services/auditLogs', { params, loader: loading })
    auditLogs.value = data.auditLogs || []
    grouped.value = data.grouped || {}
    total.value = data.total || 0
  }

  watch(filters, () => fetchAuditLogs(), { deep: true })

  return {
    loading,
    auditLogs,
    grouped,
    total,
    filters,
    fetchAuditLogs,
  }
}

export function provideAuditLogs() {
  const state = AuditLogsState()
  provide(symbol, state)
  return state
}

export function useAuditLogs() {
  return inject(symbol)
}

import { currentCompany } from '@/utils/currentCompany.js'

const symbol = Symbol('useAuditLogs')

function AuditLogsState() {
  const filters = ref({
    modules: [],
    actions: [],
    performedBy: null,
    entityType: null,
    dateFrom: null,
    dateTo: null,
  })

  const auditLogs = useLiveQueryWithDeps(
    [
      () => currentCompany.value?.id,
      () => filters.value.modules,
      () => filters.value.actions,
      () => filters.value.performedBy,
      () => filters.value.entityType,
      () => filters.value.dateFrom,
      () => filters.value.dateTo,
    ],
    async (db, [companyId, modules, actions, performedBy, entityType, dateFrom, dateTo]) => {
      if (!companyId) return []

      let query = db.AuditLog.where()

      let results = await query.orderBy('createdAt', 'desc').limit(200).exec()

      if (modules?.length) {
        results = results.filter((log) => modules.includes(log.moduleId))
      }
      if (actions?.length) {
        results = results.filter((log) => actions.includes(log.action))
      }
      if (performedBy) {
        results = results.filter((log) => log.performedBy === performedBy)
      }
      if (entityType) {
        results = results.filter((log) => log.entityType === entityType)
      }
      if (dateFrom) {
        results = results.filter((log) => log.createdAt >= dateFrom)
      }
      if (dateTo) {
        results = results.filter((log) => log.createdAt <= dateTo)
      }

      return results
    },
    { models: 'AuditLog', initial: [] },
  )

  const loading = computed(() => auditLogs.value === undefined)

  function resetFilters() {
    filters.value = {
      modules: [],
      actions: [],
      performedBy: null,
      entityType: null,
      dateFrom: null,
      dateTo: null,
    }
  }

  return {
    filters,
    auditLogs,
    loading,
    resetFilters,
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

import { get } from '@/api'

const symbol = Symbol('useImpersonate')

function ImpersonateState() {
  const companies = ref([])
  const totalCount = ref(0)
  const loading = ref(false)
  const search = ref('')

  const companyDetail = ref(null)
  const companyUsers = ref([])
  const companyUsersTotalCount = ref(0)
  const companyUsersLoading = ref(false)
  const companyUsersSearch = ref('')

  const limit = 50

  async function fetchCompanies({ append = false } = {}) {
    const offset = append ? companies.value.length : 0

    const params = { limit, offset }
    if (search.value.trim()) {
      params.search = search.value.trim()
    }

    const data = await get('/v1/auth/impersonate/companies', {
      params,
      loader: loading,
    })

    if (append) {
      companies.value = [...companies.value, ...(data.companies || [])]
    } else {
      companies.value = data.companies || []
    }
    totalCount.value = data.totalCount || 0
  }

  async function fetchCompanyUsers(companyId, { append = false } = {}) {
    const offset = append ? companyUsers.value.length : 0

    const params = { limit, offset }
    if (companyUsersSearch.value.trim()) {
      params.search = companyUsersSearch.value.trim()
    }

    const data = await get(`/v1/auth/impersonate/companies/${companyId}/users`, {
      params,
      loader: companyUsersLoading,
    })

    companyDetail.value = data.company || null
    if (append) {
      companyUsers.value = [...companyUsers.value, ...(data.users || [])]
    } else {
      companyUsers.value = data.users || []
    }
    companyUsersTotalCount.value = data.totalCount || 0
  }

  const hasMore = computed(() => companies.value.length < totalCount.value)
  const hasMoreUsers = computed(() => companyUsers.value.length < companyUsersTotalCount.value)

  return {
    companies,
    totalCount,
    loading,
    search,
    fetchCompanies,
    hasMore,
    companyDetail,
    companyUsers,
    companyUsersTotalCount,
    companyUsersLoading,
    companyUsersSearch,
    fetchCompanyUsers,
    hasMoreUsers,
  }
}

export function provideImpersonate() {
  const state = ImpersonateState()
  provide(symbol, state)
  return state
}

export function useImpersonate() {
  return inject(symbol)
}

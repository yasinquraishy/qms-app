import { currentSession } from './currentSession'
import { get } from '@/api'

export const currentCompany = ref(null)
export const companies = ref([])

export async function initCurrentCompany() {
  const data = await get('/v1/services/mycompanies')
  companies.value = data.companies
  currentCompany.value = data.companies.find((c) => c.id === currentSession.value?.companyId)
}

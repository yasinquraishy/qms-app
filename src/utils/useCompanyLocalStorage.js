import { useLocalStorage } from '@vueuse/core'
import { currentCompany } from './currentCompany'

export function useCompanyLocalStorage(key, defaultValue = null) {
  const storageKey = computed(() => {
    const keyPrefix = currentCompany.value?.id ?? 'all'
    return `company-${keyPrefix}-${key}`
  })
  return useLocalStorage(storageKey, defaultValue)
}

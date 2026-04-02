import { provide, inject } from 'vue'

const symbol = Symbol('usePageInfo')

export function providePageInfo(pageInfo) {
  provide(symbol, pageInfo)
  return pageInfo
}

export function usePageInfo() {
  return inject(symbol)
}

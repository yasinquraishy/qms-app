<script setup>
import { initSession, currentSession } from '@/utils/currentSession'
import { initCurrentCompany, companies } from '@/utils/currentCompany'
import { isPublicRoute as isPublicRouteFn, isAuthRoute } from '@/constants/authRoutes'
import { provideNotifications } from '@/composables/useNotifications.js'

provideNotifications()

const pageInfo = ref({
  showHeader: true,
})
providePageInfo(pageInfo)
const route = useRoute()
const openRoutes = ['/form']
const loading = ref(true)
const showFormBuilder = computed(() => {
  return route.name === '/[companyCode]/templates/[[id]]' && route.query.mode === 'schema'
})
const currentPath = window.location.pathname
const isOpenRoute = openRoutes.some(
  (route) => currentPath === route || currentPath.startsWith(`${route}/`),
)
// Check if this is a public route that doesn't depend on companyCode
const isPublicRoute = isPublicRouteFn(currentPath)
onMounted(async () => {
  if (isOpenRoute) {
    loading.value = false
    return
  }

  if (isPublicRoute) {
    // For public routes, just init session without companyCode
    await initSession()
    if (currentSession.value && isAuthRoute(currentPath)) {
      await initCurrentCompany()
      if (companies.value.length > 0) {
        const firstCompanyCode = companies.value[0].code
        window.location.href = `/${firstCompanyCode}/dashboard`
        return
      }
    }
    loading.value = false
    return
  }

  // Extract companyCode from the pathname since route.params isn't populated yet
  const pathParts = currentPath.split('/').filter((part) => part !== '')
  const companyCode = pathParts[0] // First segment is the company code

  await initSession(companyCode)
  await initCurrentCompany()

  const isCompanyExists = companies.value.some((c) => c.code === companyCode)
  if (!isCompanyExists && companies.value.length > 0) {
    const firstCompanyCode = companies.value[0].code
    window.location.href = `/${firstCompanyCode}/dashboard`
  }

  loading.value = false
})
</script>

<template>
  <!-- Full-screen loader overlay -->
  <div v-if="loading" class="fixed-full flex flex-center bg-dark" style="z-index: 9999">
    <div class="tw:text-center">
      <QSpinner color="primary" size="80px" />
      <div class="tw:text-lg tw:font-semibold tw:text-white tw:mt-4">Loading...</div>
    </div>
  </div>

  <!-- Main content -->
  <div v-else-if="isPublicRoute || isOpenRoute" class="tw:flex tw:flex-col tw:grow">
    <router-view />
  </div>

  <div v-else class="tw:flex tw:flex-col tw:h-screen tw:w-full">
    <FormTemplateSchemaBuilder v-if="showFormBuilder" :id="route.params.id" />

    <main v-else class="tw:flex! tw:flex-1 tw:overflow-hidden">
      <MainSidebar />

      <!-- Main Content -->
      <div class="tw:flex tw:flex-1 tw:flex-col tw:overflow-hidden">
        <MainHeader v-if="pageInfo.showHeader" />
        <div class="tw:flex-1 tw:overflow-auto">
          <RouterView />
        </div>
      </div>
    </main>
  </div>
</template>

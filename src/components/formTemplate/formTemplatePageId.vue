<script setup>
import { currentCompany } from '@/utils/currentCompany.js'
import { getCompanyPath } from '@/utils/routeHelpers'
import { get } from '@/api'

// Props
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

// Composables
const route = useRoute()

// Refs
const template = ref(null)
const loading = ref(false)
const error = ref(null)

// Computed
const mode = computed(() => route.query.mode || 'details')

const breadcrumbItems = computed(() => {
  const items = [
    { label: 'Form Templates', to: getCompanyPath('/templates') },
    {
      label: template.value?.title || 'Template Details',
      to: mode.value === 'records' ? getCompanyPath(`/templates/${props.id}`) : undefined,
    },
  ]

  if (mode.value === 'records') {
    items.push({ label: 'Records' })
  }

  return items
})

// Functions
async function fetchTemplate() {
  if (!props.id || !currentCompany.value?.id) return

  error.value = null

  const data = await get(`/v1/services/formTemplates/${props.id}`, {
    params: { companyId: currentCompany.value.id },
    loader: loading,
  })
  template.value = data.formTemplate
}

// Watchers
watch(
  [() => props.id, () => currentCompany.value?.id],
  () => {
    fetchTemplate()
  },
  { immediate: true },
)
</script>

<template>
  <!-- Header Title Section -->
  <SafeTeleport to="#main-header-title">
    <WBreadcrumbs :items="breadcrumbItems" />
  </SafeTeleport>

  <!-- Conditional Content Based on Mode -->
  <FormTemplatePageIdDetails
    v-if="mode === 'details'"
    :template="template"
    :loading="loading"
    :error="error"
    @refresh="fetchTemplate"
  />

  <FormTemplateRecords
    v-else-if="mode === 'records' && template"
    :templateId="template.id"
    :templateName="template.title"
    :schema="template.schema"
  />
</template>

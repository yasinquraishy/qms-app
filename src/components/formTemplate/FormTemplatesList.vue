<script setup>
import { useQuasar } from 'quasar'
import { isAllowed } from '@/utils/currentSession.js'
import { get } from '@/api'

const { templates, loading, deleteTemplate } = useFormTemplates()
const $q = useQuasar()

const canDeleteTemplate = computed(() => isAllowed(['formTemplates:delete']))

const showPreviewDialog = ref(false)
const previewTemplate = ref(null)
const previewLoading = ref(false)

async function handlePreview(template) {
  showPreviewDialog.value = true
  previewTemplate.value = null

  const data = await get(`/v1/services/formTemplates/${template.id}`, {
    params: { companyId: template.companyId },
    loader: previewLoading,
  })
  previewTemplate.value = data.formTemplate
}

const previewSchema = computed(() => {
  if (!previewTemplate.value?.schema) return []
  return Array.isArray(previewTemplate.value.schema) ? previewTemplate.value.schema : []
})

const previewTitle = computed(() => {
  if (!previewTemplate.value) return 'Form Preview'
  return `Preview: ${previewTemplate.value.title} (v${previewTemplate.value.version})`
})

async function handleDelete(template) {
  $q.dialog({
    title: 'Confirm Deletion',
    message: `Are you sure you want to delete form template "${template.title}" (${template.code})? This action cannot be undone.`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const success = await deleteTemplate(template.id)
    if (success) {
      $q.notify({
        type: 'positive',
        message: 'Form template deleted successfully',
      })
    } else {
      $q.notify({
        type: 'negative',
        message: 'Failed to delete form template',
      })
    }
  })
}
</script>

<template>
  <div class="tw:flex tw:flex-col tw:gap-2">
    <!-- Loading State -->
    <div v-if="loading" class="tw:flex tw:justify-center tw:py-12">
      <QSpinner color="primary" size="48px" />
    </div>

    <!-- Empty State -->
    <WEmptyState
      v-else-if="!templates || templates.length === 0"
      icon="description"
      title="No templates found"
      compact
    />

    <!-- Template Cards -->
    <FormTemplateListingRow
      v-for="template in templates"
      :key="template.id"
      :template="template"
      :canDelete="canDeleteTemplate"
      @preview="handlePreview"
      @delete="handleDelete"
    />
  </div>

  <!-- Preview Dialog -->
  <QDialog v-model="showPreviewDialog" maximized>
    <FormTemplatePreview
      :title="previewTitle"
      :schema="previewSchema"
      :loading="previewLoading"
      @submit="showPreviewDialog = false"
      @close="showPreviewDialog = false"
    />
  </QDialog>
</template>

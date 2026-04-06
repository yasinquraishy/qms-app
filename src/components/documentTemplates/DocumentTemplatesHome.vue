<script setup>
import { useQuasar } from 'quasar'
import { useDocumentTemplates } from '@/composables/useDocumentTemplates.js'
import { isAllowed } from '@/utils/currentSession.js'
import { getCompanyPath } from '@/utils/routeHelpers.js'

const router = useRouter()
const $q = useQuasar()

const { documentTemplates, loading, updateDocumentTemplate, fetchDocumentTemplates } =
  useDocumentTemplates()

const canCreate = computed(() => isAllowed(['document-templates:create']))
const canUpdate = computed(() => isAllowed(['document-templates:update']))
const canArchive = computed(() => isAllowed(['document-templates:delete']))

// Computed stats
const totalTemplates = computed(() => documentTemplates.value.length)
const activeTemplates = computed(
  () => documentTemplates.value.filter((t) => t.statusId === 'ACTIVE').length,
)
const withTraining = computed(
  () => documentTemplates.value.filter((t) => t.trainingAvailable).length,
)

function navigateToCreate() {
  router.push(getCompanyPath('/document-templates/create'))
}

function navigateToDetail(row) {
  router.push(getCompanyPath(`/document-templates/${row.id}`))
}

async function onArchiveTemplate(row) {
  $q.dialog({
    title: 'Confirm Archive',
    message: `Are you sure you want to archive "${row.name}"? This will make it unavailable for new documents.`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const result = await updateDocumentTemplate(row.id, { statusId: 'ARCHIVED' })
    if (result.error) {
      $q.notify({ type: 'negative', message: result.error })
    } else {
      $q.notify({ type: 'positive', message: 'Template archived successfully' })
    }
  })
}

async function onUnarchiveTemplate(row) {
  $q.dialog({
    title: 'Confirm Unarchive',
    message: `Are you sure you want to unarchive "${row.name}"?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const result = await updateDocumentTemplate(row.id, { statusId: 'ACTIVE' })
    if (result.error) {
      $q.notify({ type: 'negative', message: result.error })
    } else {
      $q.notify({ type: 'positive', message: 'Template unarchived successfully' })
    }
  })
}

onMounted(() => {
  fetchDocumentTemplates()
})
</script>

<template>
  <div class="tw:flex tw:flex-col tw:gap-3 tw:h-full tw:p-5">
    <SafeTeleport to="#main-header-title">
      <div class="tw:flex tw:items-center tw:gap-2 tw:text-on-sidebar">
        <WIcon icon="description" class="tw:text-primary" size="24px" />
        <h2 class="tw:text-lg tw:font-bold tw:tracking-tight tw:text-nowrap">Document Templates</h2>
      </div>
    </SafeTeleport>

    <SafeTeleport to="#main-header-actions">
      <WBtn
        v-if="canCreate"
        label="Create Template"
        icon="add"
        color="primary"
        unelevated
        class="tw:font-medium"
        @click="navigateToCreate"
      />
    </SafeTeleport>

    <!-- Page Header -->
    <div class="tw:flex tw:items-center tw:justify-between">
      <div class="tw:flex tw:flex-col tw:gap-1">
        <div class="tw:text-3xl tw:font-bold tw:text-on-sidebar">Document Templates</div>
        <div class="tw:text-sm tw:text-secondary">
          Define document lifecycles, metadata, and structural components.
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <DocumentTemplatesStatsCards
      :total="totalTemplates"
      :active="activeTemplates"
      :withTraining="withTraining"
      :loading="loading"
    />

    <!-- Templates Table -->
    <DocumentTemplatesTable
      :rows="documentTemplates"
      :loading="loading"
      :canUpdate="canUpdate"
      :canArchive="canArchive"
      @view="navigateToDetail"
      @archive="onArchiveTemplate"
      @unarchive="onUnarchiveTemplate"
    />
  </div>
</template>

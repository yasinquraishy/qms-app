<script setup>
import { useFormTemplates } from '@/composables/useFormTemplates.js'
import { getCompanyPath } from '@/utils/routeHelpers'
import { useCompanyLocalStorage } from '@/utils/useCompanyLocalStorage'
import { isAllowed } from '@/utils/currentSession.js'

// Composables
const router = useRouter()

// Refs
const showCreateDialog = ref(false)
const viewMode = useCompanyLocalStorage('templates-view-mode', 'list') // 'list' or 'table'

const canCreateTemplate = computed(() => isAllowed(['formTemplates:create']))

// Data
const { filters } = useFormTemplates()

const viewSwitches = [
  { icon: 'view_agenda', value: 'list', tooltip: 'List View' },
  { icon: 'table_rows', value: 'table', tooltip: 'Table View' },
]

// Functions
function handleTemplateCreated(template) {
  const path = getCompanyPath(`/templates/${template.id}`)
  router.push({ path, query: { mode: 'schema' } })
}
</script>

<template>
  <div class="tw:flex tw:flex-col tw:gap-3 tw:h-full tw:p-5">
    <SafeTeleport to="#main-header-title">
      <div class="tw:flex tw:items-center tw:gap-2 tw:text-on-sidebar">
        <WIcon icon="layers" class="tw:text-primary" size="24px" />
        <h2 class="tw:text-lg tw:font-bold tw:tracking-tight tw:text-nowrap">Form Templates</h2>
      </div>
    </SafeTeleport>

    <SafeTeleport to="#main-header-actions">
      <WBtn
        v-if="canCreateTemplate"
        label="Create New Template"
        icon="add"
        color="primary"
        unelevated
        class="tw:font-medium"
        @click="showCreateDialog = true"
      />
    </SafeTeleport>

    <!-- Page Header -->
    <div class="tw:flex tw:items-center tw:justify-between">
      <div class="tw:flex tw:flex-col tw:gap-1">
        <div class="tw:text-3xl tw:font-bold tw:text-on-sidebar">Form Templates</div>
        <div class="tw:text-sm tw:text-secondary">
          Manage the structure and versioning of QMS forms (CAPA, NC, Audit).
        </div>
      </div>
    </div>

    <formTemplatesFilterToolbar v-model:filters="filters">
      <template #actions>
        <WSwitcher v-model="viewMode" :switches="viewSwitches" />
      </template>
    </formTemplatesFilterToolbar>

    <!-- Content Views -->
    <FormTemplatesTable v-if="viewMode === 'table'" />
    <div v-else class="tw:flex-1 tw:overflow-y-auto">
      <FormTemplatesList />
    </div>
  </div>

  <!-- Create Template Dialog -->
  <formTemplateCreateTemplate v-model="showCreateDialog" @next="handleTemplateCreated" />
</template>

<style scoped lang="scss">
.text-slate-800 {
  color: #1e293b;
}
</style>

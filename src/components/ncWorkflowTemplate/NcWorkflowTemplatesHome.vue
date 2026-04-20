<script setup>
import { IconRouteSquare2, IconLayoutList, IconLayoutRows } from '@tabler/icons-vue'
import { getCompanyPath } from '@/utils/routeHelpers'
import { useCompanyLocalStorage } from '@/utils/useCompanyLocalStorage'
import { isAllowed } from '@/utils/currentSession.js'

const router = useRouter()

const showCreateDialog = ref(false)
const viewMode = useCompanyLocalStorage('nc-workflow-templates-view-mode', 'table')

const filters = ref({ search: '', statusId: null })

const canCreate = computed(() => isAllowed(['ncWorkflow:create']))

const viewSwitches = [
  { icon: IconLayoutList, value: 'list', tooltip: 'List View' },
  { icon: IconLayoutRows, value: 'table', tooltip: 'Table View' },
]

function handleCreated(template) {
  router.push(getCompanyPath(`/nc-workflow-templates/${template.id}`))
}
</script>

<template>
  <div class="tw:flex tw:flex-col tw:gap-3 tw:h-full tw:p-5">
    <SafeTeleport to="#main-header-title">
      <div class="tw:flex tw:items-center tw:gap-2 tw:text-on-sidebar">
        <IconRouteSquare2 class="tw:text-primary" :size="24" />
        <h2 class="tw:text-lg tw:font-bold tw:tracking-tight tw:text-nowrap">
          NC Workflow Templates
        </h2>
      </div>
    </SafeTeleport>

    <SafeTeleport to="#main-header-actions">
      <BaseButton v-if="canCreate" @click="showCreateDialog = true">Create Template</BaseButton>
    </SafeTeleport>

    <!-- Page Header -->
    <div class="tw:flex tw:items-center tw:justify-between">
      <div class="tw:flex tw:flex-col tw:gap-1">
        <div class="tw:text-3xl tw:font-bold tw:text-on-sidebar">NC Workflow Templates</div>
        <div class="tw:text-sm tw:text-secondary">
          Design and manage stage-based workflows for Non-Conformance records.
        </div>
      </div>
    </div>

    <NcWorkflowTemplatesFilterToolbar v-model:filters="filters">
      <template #actions>
        <BaseSwitcher v-model="viewMode" :switches="viewSwitches" />
      </template>
    </NcWorkflowTemplatesFilterToolbar>

    <!-- Content Views -->
    <NcWorkflowTemplatesTable v-if="viewMode === 'table'" :filters="filters" />
    <div v-else class="tw:flex-1 tw:overflow-y-auto">
      <NcWorkflowTemplatesList :filters="filters" />
    </div>
  </div>

  <!-- Create Dialog -->
  <NcWorkflowTemplateCreateDialog v-model="showCreateDialog" @created="handleCreated" />
</template>

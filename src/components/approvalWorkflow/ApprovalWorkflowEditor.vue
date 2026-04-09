<script setup>
import { IconHistory, IconLock, IconCheck } from '@tabler/icons-vue'
import { useQuasar } from 'quasar'
import { isAllowed } from '@/utils/currentSession'
import { getCompanyPath } from '@/utils/routeHelpers'
import { useApprovalWorkflows } from '@/composables/useApprovalWorkflows.js'

const props = defineProps({
  id: { type: String, required: true },
  autoAddStep: { type: Boolean, default: true },
})

const $q = useQuasar()
const router = useRouter()
const { createDraftVersion } = useApprovalWorkflows()

// --- Live data ---
const workflow = useLiveQueryWithDeps([() => props.id], async (db, [id]) =>
  db.ApprovalWorkflow.findByPk(id),
)

const versions = useLiveQueryWithDeps(
  [() => props.id],
  async (db, [id]) => {
    if (!id) return []
    return db.ApprovalWorkflowVersion.where('workflowId', id).orderBy('versionMajor', 'desc').exec()
  },
  { initial: [] },
)

const selectedVersionId = ref(null)
const selectedStepId = ref(null)

watch(
  versions,
  (vs) => {
    if (vs?.length > 0 && !selectedVersionId.value) {
      selectedVersionId.value = vs.find((v) => v.isCurrent)?.id ?? vs[0].id
    }
  },
  { immediate: true },
)

watch(
  () => props.id,
  () => {
    selectedVersionId.value = null
    selectedStepId.value = null
  },
)

const selectedVersion = computed(
  () => versions.value?.find((v) => v.id === selectedVersionId.value) ?? null,
)

// --- Computed ---
const breadcrumbItems = computed(() => [
  { label: 'Approval Workflows', to: getCompanyPath('/approval-workflows') },
  { label: workflow.value?.name || 'Edit Workflow' },
])

const versionLabel = computed(() => {
  const v = selectedVersion.value
  if (!v) return ''
  return v.versionLabel || `${v.versionMajor}.${v.versionMinor}`
})

const isViewingOldVersion = computed(() => {
  if (!selectedVersion.value) return false
  return !selectedVersion.value.isCurrent
})

const isDraftVersion = computed(() => selectedVersion.value?.statusId === 'DRAFT')

const canUpdate = computed(() => {
  if (!workflow.value || !selectedVersion.value) return false
  return (
    isDraftVersion.value && !isViewingOldVersion.value && isAllowed(['approvalWorkflows:update'])
  )
})

const canCreateDraft = computed(() => {
  const haveDraftVersion = versions.value.some((v) => v.statusId === 'DRAFT')
  return isAllowed(['approvalWorkflows:update']) && !haveDraftVersion
})

// --- Handlers ---
const saving = ref(false)

async function handleSave(statusOverride) {
  if (isViewingOldVersion.value) {
    $q.notify({
      type: 'warning',
      message: 'Switch to the current version to make edits',
      position: 'top',
    })
    return
  }
  if (!isDraftVersion.value) {
    $q.notify({
      type: 'warning',
      message: 'This version is locked. Create a new draft to make changes.',
      position: 'top',
    })
    return
  }
  if (!selectedVersion.value || !workflow.value) return

  // Validate each step has at least one role or reviewer
  // TODO: need to do publishing in backend
  const stepsWithoutAssignees = []
  if (stepsWithoutAssignees.length > 0) {
    $q.notify({
      type: 'warning',
      message: '  // TODO: need to do publishing in backend',
      position: 'top',
    })
    return
  }

  saving.value = true
  try {
    // Save workflow metadata
    await workflow.value.save()

    // Update version status
    selectedVersion.value.statusId = statusOverride
    await selectedVersion.value.save()

    $q.notify({
      type: 'positive',
      message:
        statusOverride === 'PUBLISHED'
          ? 'Workflow published successfully'
          : 'Workflow saved successfully',
      position: 'top',
    })
  } catch {
    $q.notify({ type: 'negative', message: 'Failed to save workflow', position: 'top' })
  } finally {
    saving.value = false
  }
}

const creatingDraft = ref(false)

async function handleCreateDraft(majorBump = false) {
  creatingDraft.value = true
  try {
    await createDraftVersion(props.id, { majorBump })
    $q.notify({ type: 'positive', message: 'New draft version created', position: 'top' })
    // Reset so watch(versions) will auto-select the new draft
    selectedVersionId.value = null
  } catch {
    $q.notify({ type: 'negative', message: 'Failed to create draft version', position: 'top' })
  } finally {
    creatingDraft.value = false
  }
}

function goBack() {
  router.push(getCompanyPath('/approval-workflows'))
}

function selectVersion(version) {
  if (version.id === selectedVersionId.value) return
  selectedVersionId.value = version.id
}

function handleVersionSelect(version, close) {
  selectVersion(version)
  close()
}
</script>

<template>
  <div class="tw:flex tw:flex-col tw:h-full tw:overflow-hidden">
    <!-- Loading State -->
    <div v-if="!workflow" class="tw:flex tw:items-center tw:justify-center tw:h-full">
      <div
        class="tw:w-8 tw:h-8 tw:border-2 tw:border-primary tw:border-t-transparent tw:rounded-full tw:animate-spin"
      />
    </div>

    <!-- Content -->
    <template v-else>
      <!-- Header -->
      <SafeTeleport to="#main-header-title">
        <WBreadcrumbs :items="breadcrumbItems" />
      </SafeTeleport>

      <SafeTeleport to="#main-header-actions">
        <div class="tw:flex tw:items-center tw:gap-3">
          <!-- Version Selector -->
          <BasePopover placement="bottom-end">
            <template #button>
              <ApprovalWorkflowVersionStatusBadgeById
                v-if="selectedVersion?.statusId"
                :statusId="selectedVersion.statusId"
                class="tw:ml-2"
                selectable
              >
                <template #icon> v{{ versionLabel }} </template>
              </ApprovalWorkflowVersionStatusBadgeById>
            </template>
            <template #content="{ close }">
              <div class="tw:w-64 tw:py-2">
                <p
                  class="tw:px-3 tw:py-1 tw:text-xs tw:font-semibold tw:text-secondary tw:uppercase tw:tracking-wide"
                >
                  Version History
                </p>
                <button
                  v-for="version in versions"
                  :key="version.id"
                  class="tw:w-full tw:text-left tw:px-3 tw:py-2 tw:hover:bg-main-hover tw:transition-colors"
                  :class="version.id === selectedVersionId ? 'tw:bg-primary/5 tw:text-primary' : ''"
                  @click="handleVersionSelect(version, close)"
                >
                  <div class="tw:flex tw:flex-nowrap tw:items-center tw:text-sm">
                    <span
                      >v{{
                        version.versionLabel || `${version.versionMajor}.${version.versionMinor}`
                      }}</span
                    >
                    <ApprovalWorkflowVersionStatusBadgeById
                      v-if="version.statusId"
                      :statusId="version.statusId"
                      class="tw:ml-1"
                    />
                    <span v-if="version.isCurrent" class="tw:text-primary tw:font-bold tw:ml-1"
                      >(Current)</span
                    >
                  </div>
                </button>
              </div>
            </template>
          </BasePopover>

          <div class="tw:h-6 tw:w-px tw:bg-divider"></div>

          <BaseButton variant="outline" @click="goBack">Cancel</BaseButton>
          <template v-if="canUpdate">
            <BaseButton :isLoading="saving" @click="handleSave('PUBLISHED')"> Publish </BaseButton>
          </template>
          <template v-else-if="!isViewingOldVersion">
            <BaseButton
              v-if="canCreateDraft"
              :isLoading="creatingDraft"
              @click="handleCreateDraft(false)"
            >
              Create New Draft
            </BaseButton>
          </template>
        </div>
      </SafeTeleport>

      <!-- Old version banner -->
      <div
        v-if="isViewingOldVersion"
        class="tw:bg-amber-50 tw:border-b tw:border-amber-200 tw:px-6 tw:py-3 tw:flex tw:items-center tw:gap-3"
      >
        <IconHistory :size="20" class="tw:text-amber-600" />
        <span class="tw:text-sm tw:text-amber-800 tw:font-medium">
          Viewing version v{{
            selectedVersion?.versionLabel ||
            `${selectedVersion?.versionMajor}.${selectedVersion?.versionMinor}`
          }}
          (read-only).
        </span>
        <BaseButton
          variant="text-link"
          @click="selectVersion(versions.find((v) => v.isCurrent) || versions[0])"
        >
          Back to current
        </BaseButton>
      </div>
      <div
        v-else-if="!isDraftVersion"
        class="tw:bg-amber-50 tw:border-b tw:border-amber-200 tw:px-6 tw:py-3 tw:flex tw:items-center tw:gap-3"
      >
        <IconLock :size="20" class="tw:text-amber-600" />
        <span class="tw:text-sm tw:text-amber-800 tw:font-medium">
          This version is published and locked. Create a new draft to make changes.
        </span>
      </div>

      <!-- Global Settings -->
      <div class="tw:flex tw:flex-col tw:bg-main tw:border-b tw:border-divider tw:px-6 tw:py-4">
        <div class="tw:grid tw:grid-cols-2 tw:md:grid-cols-3 tw:gap-4">
          <div class="tw:flex-1">
            <label
              class="tw:block tw:text-xs tw:font-bold tw:text-secondary tw:uppercase tw:mb-1.5"
            >
              Workflow Name
            </label>
            <BaseTextInput
              v-model="workflow.name"
              name="name"
              placeholder="e.g. Global SOP Multi-Stage Approval"
              :disabled="!canUpdate"
            />
          </div>
          <div class="tw:flex-1">
            <label
              class="tw:block tw:text-xs tw:font-bold tw:text-secondary tw:uppercase tw:mb-1.5"
            >
              Module
            </label>
            <ModuleSelectMenu v-model="workflow.moduleId" required :disabled="!canUpdate" />
          </div>
          <div class="tw:flex-1">
            <label
              class="tw:block tw:text-xs tw:font-bold tw:text-secondary tw:uppercase tw:mb-1.5"
            >
              Document Type
            </label>
            <DocumentTypeSelectMenu
              v-model="workflow.documentTypeId"
              required
              :disable="!canUpdate"
            />
          </div>
        </div>
      </div>

      <!-- Two-Pane Designer -->
      <div v-if="selectedVersion" class="tw:flex tw:flex-1 tw:overflow-hidden">
        <!-- Left Pane: Step List -->
        <ApprovalWorkflowStepList
          v-model:stepId="selectedStepId"
          :versionId="selectedVersionId"
          :canUpdate="canUpdate"
          :autoAddStep="autoAddStep"
        />

        <!-- Right Pane: Step Editor -->
        <div class="tw:flex-1 tw:overflow-y-auto tw:bg-main tw:p-8">
          <div v-if="selectedStepId" class="tw:max-w-4xl tw:mx-auto tw:space-y-10">
            <ApprovalWorkflowStepEditor :stepId="selectedStepId" :canUpdate="canUpdate" />
          </div>

          <div
            v-else
            class="tw:flex tw:flex-col tw:items-center tw:justify-center tw:h-full tw:gap-4 tw:text-secondary"
          >
            <IconCheck :size="48" class="tw:opacity-30" />
            <p class="tw:text-sm tw:font-medium">
              Select a step from the left panel or use the 'Add Step' button to get started.
            </p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

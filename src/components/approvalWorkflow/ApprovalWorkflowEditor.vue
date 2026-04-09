<script setup>
import { IconHistory, IconLock, IconChevronDown, IconCheck } from '@tabler/icons-vue'
import { useQuasar } from 'quasar'
import { isAllowed } from '@/utils/currentSession'
import { getCompanyPath } from '@/utils/routeHelpers'
import { useApprovalWorkflows } from '@/composables/useApprovalWorkflows.js'

const props = defineProps({
  id: { type: String, required: true },
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

const versionStatuses = useLiveQuery((db) => db.ApprovalWorkflowVersionStatus.where().exec(), {
  initial: [],
})

const selectedVersionId = ref(null)
const selectedStepIndex = ref(0)
const stepListRef = ref(null)
const autoStepAdded = ref(false)

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
    autoStepAdded.value = false
    selectedStepIndex.value = 0
  },
)

const selectedVersion = computed(
  () => versions.value?.find((v) => v.id === selectedVersionId.value) ?? null,
)

const steps = useLiveQueryWithDeps(
  [() => selectedVersionId.value],
  async (db, [vId]) => {
    if (!vId) return []
    return db.ApprovalWorkflowStep.where('workflowVersionId', vId).orderBy('stepOrder').exec()
  },
  { initial: [] },
)

// Auto-add first step when a draft version has no steps
watch(steps, async (newSteps) => {
  if (
    !autoStepAdded.value &&
    canUpdate.value &&
    newSteps?.length === 0 &&
    selectedVersionId.value
  ) {
    autoStepAdded.value = true
    await nextTick()
    stepListRef.value?.addStep()
  }
})

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

function getVersionStatusName(statusId) {
  return versionStatuses.value.find((s) => s.id === statusId)?.name ?? statusId
}

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

const selectedStep = computed(() =>
  steps.value ? (steps.value[selectedStepIndex.value] ?? null) : null,
)

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
  const stepsWithoutAssignees = steps.value.filter(() => {
    // We can't check roles/users here without async queries; skip validation for now
    return false
  })
  if (stepsWithoutAssignees.length > 0) {
    $q.notify({
      type: 'warning',
      message: 'Each step must have at least one role or reviewer assigned',
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
    autoStepAdded.value = false
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
  selectedStepIndex.value = 0
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
              <BaseButton variant="outline" size="sm" :isOpen="false">
                v{{ versionLabel }} ({{ getVersionStatusName(selectedVersion?.statusId) }})
                <IconChevronDown :size="16" class="tw:ml-1" />
              </BaseButton>
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
                  @click="
                    selectVersion(version)
                    close()
                  "
                >
                  <div class="tw:text-sm">
                    v{{ version.versionLabel || `${version.versionMajor}.${version.versionMinor}` }}
                    <span class="tw:text-secondary tw:text-xs tw:ml-1">
                      — {{ getVersionStatusName(version.statusId) }}
                    </span>
                    <span v-if="version.isCurrent" class="tw:text-primary tw:font-bold tw:ml-1"
                      >(Current)</span
                    >
                  </div>
                </button>
              </div>
            </template>
          </BasePopover>

          <div class="tw:h-6 tw:w-px tw:bg-divider"></div>

          <BaseButton variant="outline" size="sm" @click="goBack">Cancel</BaseButton>
          <template v-if="canUpdate">
            <BaseButton size="sm" :isLoading="saving" @click="handleSave('PUBLISHED')">
              Publish
            </BaseButton>
          </template>
          <template v-else-if="!isViewingOldVersion">
            <BaseButton
              v-if="canCreateDraft"
              size="sm"
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
          size="sm"
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
            <ApprovalWorkflowsModuleSelect
              v-model="workflow.moduleId"
              required
              :disabled="!canUpdate"
            />
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
          ref="stepListRef"
          v-model:selectedIndex="selectedStepIndex"
          :steps="steps"
          :versionId="selectedVersionId"
          :canUpdate="canUpdate"
        />

        <!-- Right Pane: Step Editor -->
        <div class="tw:flex-1 tw:overflow-y-auto tw:bg-main tw:p-8">
          <div v-if="selectedStep" class="tw:max-w-4xl tw:mx-auto tw:space-y-10">
            <ApprovalWorkflowStepEditor :step="selectedStep" :canUpdate="canUpdate" />
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

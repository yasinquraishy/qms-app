<script setup>
import { useDebounceFn } from '@vueuse/core'
import { required, helpers } from '@vuelidate/validators'
import { useValidator } from '@shared/composables/validator.js'
import { useApprovalWorkflows } from '@/composables/useApprovalWorkflows.js'
import { getCompanyPath } from '@/utils/routeHelpers'
import { useQuasar } from 'quasar'
import { isAllowed } from '@/utils/currentSession'

const props = defineProps({
  id: { type: String, required: true },
})

const $q = useQuasar()
const router = useRouter()

const {
  currentWorkflow,
  fetchWorkflow,
  updateWorkflow,
  updateWorkflowVersion,
  createDraftVersion,
  loading,
  fetchStatuses,
  fetchVersions,
  fetchWorkflows,
} = useApprovalWorkflows()

const saving = ref(false)
const selectedStepIndex = ref(0)
const versions = ref([])
const versionsLoading = ref(false)
const selectedVersion = ref(null)
const creatingDraft = ref(false)
const isAutoSaving = ref(false)
const stepListRef = ref(null)
const autoSaving = refDebounced(isAutoSaving, 100)

const form = ref({
  name: '',
  description: '',
  moduleId: null,
  documentTypeId: null,
})

const rules = computed(() => ({
  name: { required: helpers.withMessage('Required', required) },
}))

const validator = useValidator(rules, form)

const breadcrumbItems = computed(() => [
  { label: 'Approval Workflows', to: getCompanyPath('/approval-workflows') },
  { label: form.value.name || 'Edit Workflow' },
])

const selectedStep = computed(() =>
  selectedVersion.value?.steps
    ? selectedVersion.value.steps[selectedStepIndex.value] || null
    : null,
)

const versionLabel = computed(() => {
  const v = selectedVersion.value
  if (!v) return ''
  return v.versionLabel || `${v.versionMajor}.${v.versionMinor}`
})

const isViewingOldVersion = computed(() => {
  if (!selectedVersion.value || !currentWorkflow.value) return false
  return !selectedVersion.value.isCurrent
})

const isDraftVersion = computed(() => selectedVersion.value?.statusId === 'DRAFT')

const canUpdate = computed(() => {
  if (!currentWorkflow.value || !selectedVersion.value) return false

  return (
    isDraftVersion.value && !isViewingOldVersion.value && isAllowed(['approvalWorkflows:update'])
  )
})

const canCreateDraft = computed(() => {
  const haveDraftVersion = versions.value.some((v) => v.statusId === 'DRAFT')

  return isAllowed(['approvalWorkflows:update']) && !haveDraftVersion
})

function populateForm() {
  const wf = currentWorkflow.value
  if (!wf) return
  form.value = {
    name: wf.name || '',
    description: wf.description || '',
    moduleId: wf.moduleId || null,
    documentTypeId: wf.documentTypeId || null,
    statusId: wf.statusId || null,
  }
}

function setSelectedVersion(versionId) {
  const version = versions.value.find((v) => v.id === versionId)
  if (version) {
    selectedVersion.value = JSON.parse(JSON.stringify(version))
    selectedStepIndex.value = 0
  }
}

async function loadData() {
  versionsLoading.value = true
  try {
    const [, versionsResult] = await Promise.all([fetchWorkflow(props.id), fetchVersions(props.id)])
    if (!versionsResult.error) {
      versions.value = versionsResult.versions || []
    }
    populateForm()
    const currentVer = versions.value.find((v) => v.isCurrent)
    if (currentVer) {
      setSelectedVersion(currentVer.id)
    }
  } finally {
    versionsLoading.value = false
  }
}

function selectVersion(version) {
  if (version.id === selectedVersion.value?.id) return
  setSelectedVersion(version.id)
  if (version.isCurrent) {
    populateForm()
  }
}

function formatSteps(steps) {
  return steps.map((step) => ({
    name: step.name,
    description: step.description || null,
    stepOrder: step.stepOrder,
    approvalRule: step.approvalRule,
    slaDays: step.slaDays || null,
    requireComments: step.requireComments,
    requireEsignature: step.requireEsignature,
    roleIds: step.roleIds,
    reviewerIds: step.reviewerIds,
  }))
}

function buildWorkflowMetadata() {
  return {
    name: form.value.name.trim(),
    description: form.value.description.trim() || null,
    moduleId: form.value.moduleId || null,
    documentTypeId: form.value.documentTypeId || null,
    statusId: form.value.statusId || null,
  }
}

function buildSavedWorkflowMetadata() {
  return {
    name: currentWorkflow.value?.name || '',
    description: currentWorkflow.value?.description || null,
    moduleId: currentWorkflow.value?.moduleId || null,
    documentTypeId: currentWorkflow.value?.documentTypeId || null,
  }
}

async function autoSave() {
  if (
    isViewingOldVersion.value ||
    !isDraftVersion.value ||
    !selectedVersion.value ||
    !canUpdate.value
  )
    return

  isAutoSaving.value = true
  try {
    const metadata = buildWorkflowMetadata()
    if (JSON.stringify(metadata) !== JSON.stringify(buildSavedWorkflowMetadata())) {
      await updateWorkflow(props.id, metadata)
    }
    await updateWorkflowVersion(props.id, selectedVersion.value.id, {
      steps: formatSteps(selectedVersion.value.steps),
    })
  } catch (err) {
    console.error('Auto-save failed:', err)
  } finally {
    isAutoSaving.value = false
  }
}

const debouncedAutoSave = useDebounceFn(autoSave, 1000)

async function handleSave(statusOverride) {
  const valid = await validator.value.$validate()
  if (!valid) return

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
  if (!selectedVersion.value) return

  // Validate that each step has at least one role or reviewer
  const stepsWithoutAssignees = selectedVersion.value.steps.filter(
    (step) =>
      (!step.roleIds || step.roleIds.length === 0) &&
      (!step.reviewerIds || step.reviewerIds.length === 0),
  )
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
    const metadata = buildWorkflowMetadata()
    if (JSON.stringify(metadata) !== JSON.stringify(buildSavedWorkflowMetadata())) {
      await updateWorkflow(props.id, metadata)
    }

    const versionResult = await updateWorkflowVersion(props.id, selectedVersion.value.id, {
      statusId: statusOverride,
      steps: formatSteps(selectedVersion.value.steps),
    })

    if (versionResult.error) {
      $q.notify({ type: 'negative', message: versionResult.error, position: 'top' })
      return
    }

    $q.notify({
      type: 'positive',
      message:
        statusOverride === 'PUBLISHED'
          ? 'Workflow published successfully'
          : 'Workflow saved successfully',
      position: 'top',
    })

    selectedVersion.value = null
    await loadData()
    await fetchWorkflows() // Refresh the workflow list in case the name or status changed
  } catch {
    $q.notify({ type: 'negative', message: 'Failed to save workflow', position: 'top' })
  } finally {
    saving.value = false
  }
}

async function handleCreateDraft(majorBump = false) {
  creatingDraft.value = true
  try {
    const result = await createDraftVersion(props.id, { majorBump })
    if (result.error) {
      $q.notify({ type: 'negative', message: result.error, position: 'top' })
      return
    }
    $q.notify({ type: 'positive', message: 'New draft version created', position: 'top' })
    selectedVersion.value = null
    await loadData()
  } catch {
    $q.notify({ type: 'negative', message: 'Failed to create draft version', position: 'top' })
  } finally {
    creatingDraft.value = false
  }
}

function goBack() {
  router.push(getCompanyPath('/approval-workflows'))
}

onMounted(async () => {
  await loadData()
  await fetchStatuses()
  await nextTick()
  if (stepListRef.value && selectedVersion.value.steps?.length === 0) {
    stepListRef.value.addStep()
  }
})

watch(
  () => props.id,
  () => {
    if (props.id) {
      selectedVersion.value = null
      loadData()
    }
  },
)

watch(
  [form, selectedVersion],
  () => {
    if (isDraftVersion.value && !isViewingOldVersion.value) {
      debouncedAutoSave()
    }
  },
  { deep: true },
)
</script>

<template>
  <div class="tw:flex tw:flex-col tw:h-full tw:overflow-hidden">
    <!-- Loading State -->
    <div
      v-if="loading && !currentWorkflow"
      class="tw:flex tw:items-center tw:justify-center tw:h-full"
    >
      <QSpinner color="primary" size="3em" />
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
          <div class="tw:relative">
            <WBtn outline :loading="versionsLoading">
              v{{ versionLabel }} ({{ selectedVersion?.status?.name || 'Unknown' }})
              <WIcon name="expand_more" class="tw:ml-2" size="18px" />

              <QMenu>
                <QList class="tw:w-56">
                  <QItemLabel header class="ds-label-sm tw:text-secondary">
                    Version History
                  </QItemLabel>
                  <QItem
                    v-for="version in versions"
                    :key="version.id"
                    clickable
                    :active="version.id === selectedVersion?.id"
                    @click="selectVersion(version)"
                  >
                    <QItemSection>
                      <div class="tw:text-sm">
                        v{{
                          version.versionLabel || `${version.versionMajor}.${version.versionMinor}`
                        }}
                        <span class="tw:text-secondary tw:text-xs tw:ml-1">
                          — {{ version.status?.name || version.statusId }}
                        </span>
                        <span v-if="version.isCurrent" class="tw:text-primary tw:font-bold tw:ml-1">
                          (Current)
                        </span>
                      </div>
                      <div v-if="version.creator" class="tw:text-xs tw:text-secondary tw:mt-0.5">
                        by {{ version.creator.firstName }} {{ version.creator.lastName }}
                      </div>
                    </QItemSection>
                  </QItem>
                </QList>
              </QMenu>
            </WBtn>
          </div>

          <div class="tw:h-6 tw:w-px tw:bg-divider"></div>

          <WBtn label="Cancel" color="grey-7" outline class="tw:font-bold" @click="goBack" />
          <template v-if="canUpdate">
            <WBtn
              label="Publish"
              icon="publish"
              color="primary"
              unelevated
              class="tw:font-bold"
              :loading="saving"
              @click="handleSave('PUBLISHED')"
            />
            <div
              v-if="autoSaving"
              class="tw:flex tw:items-center tw:gap-2 tw:text-sm tw:text-secondary"
            >
              <WIcon name="autorenew" size="18px" class="tw:animate-spin" />
              <span>saving...</span>
            </div>
          </template>
          <template v-else-if="!isViewingOldVersion">
            <WBtn
              v-if="canCreateDraft"
              label="Create New Draft"
              icon="add"
              color="primary"
              unelevated
              class="tw:font-bold"
              :loading="creatingDraft"
              @click="handleCreateDraft(false)"
            />
          </template>
        </div>
      </SafeTeleport>

      <!-- Old version / locked version banner -->
      <div
        v-if="isViewingOldVersion"
        class="tw:bg-amber-50 tw:border-b tw:border-amber-200 tw:px-6 tw:py-3 tw:flex tw:items-center tw:gap-3"
      >
        <WIcon name="history" size="20px" class="tw:text-amber-600" />
        <span class="tw:text-sm tw:text-amber-800 tw:font-medium">
          Viewing version v{{
            selectedVersion?.versionLabel ||
            `${selectedVersion?.versionMajor}.${selectedVersion?.versionMinor}`
          }}
          (read-only).
        </span>
        <WBtn
          flat
          dense
          class="tw:text-primary tw:font-bold"
          label="Back to current"
          @click="selectVersion(versions.find((v) => v.isCurrent) || versions[0])"
        />
      </div>
      <div
        v-else-if="!isDraftVersion"
        class="tw:bg-amber-50 tw:border-b tw:border-amber-200 tw:px-6 tw:py-3 tw:flex tw:items-center tw:gap-3"
      >
        <WIcon name="lock" size="20px" class="tw:text-amber-600" />
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
            <WInput
              v-model="form.name"
              name="name"
              placeholder="e.g. Global SOP Multi-Stage Approval"
              dense
              :readonly="!canUpdate"
            />
          </div>
          <div class="tw:flex-1">
            <label
              class="tw:block tw:text-xs tw:font-bold tw:text-secondary tw:uppercase tw:mb-1.5"
            >
              Module
            </label>
            <ApprovalWorkflowsModuleSelect
              v-model:moduleId="form.moduleId"
              dense
              required
              :disable="!canUpdate"
            />
          </div>
          <div class="tw:flex-1">
            <label
              class="tw:block tw:text-xs tw:font-bold tw:text-secondary tw:uppercase tw:mb-1.5"
            >
              Document Type
            </label>
            <FormTemplatesDocumentTypeSelect
              v-model:documentTypeId="form.documentTypeId"
              dense
              required
              :disable="!canUpdate"
            />
          </div>
        </div>

        <!-- Description editor -->
      </div>

      <!-- Two-Pane Designer -->
      <div v-if="selectedVersion" class="tw:flex tw:flex-1 tw:overflow-hidden">
        <!-- Left Pane: Step List -->
        <ApprovalWorkflowStepList
          ref="stepListRef"
          v-model="selectedVersion.steps"
          v-model:selectedIndex="selectedStepIndex"
          :canUpdate="canUpdate"
        />

        <!-- Right Pane: Step Editor -->
        <div class="tw:flex-1 tw:overflow-y-auto tw:bg-main tw:p-8">
          <div v-if="selectedStep" class="tw:max-w-4xl tw:mx-auto tw:space-y-10">
            <ApprovalWorkflowStepEditor
              v-model:step="selectedVersion.steps[selectedStepIndex]"
              :canUpdate="canUpdate"
            />
          </div>

          <WEmptyState
            v-else
            icon="touch_app"
            title="No step selected"
            description="Select a step from the left panel or use the 'Add Step' button to get started."
          />
        </div>
      </div>
    </template>
  </div>
</template>

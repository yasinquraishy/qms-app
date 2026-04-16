<script setup>
import { IconHistory, IconLock, IconCheck } from '@tabler/icons-vue'
import { isAllowed } from '@/utils/currentSession'
import { getCompanyPath } from '@/utils/routeHelpers'

const props = defineProps({
  id: { type: String, required: true },
  autoAddStep: { type: Boolean, default: true },
})

const toast = useToast()
const router = useRouter()

const selectedVersionId = ref(null)
const selectedStepId = ref(null)

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

const steps = useLiveQueryWithDeps(
  [() => selectedVersionId.value],
  async (db, [versionId]) => {
    if (!versionId) return []
    return db.ApprovalWorkflowStep.where('workflowVersionId', versionId).exec()
  },
  { initial: [] },
)

const stepUsers = useLiveQueryWithDeps(
  [() => steps.value.map((s) => s.id)],
  async (db, [stepIds]) => {
    if (!stepIds || stepIds.length === 0) return []
    return db.ApprovalWorkflowStepUser.where('stepId', stepIds).exec()
  },
)

const stepRoles = useLiveQueryWithDeps(
  [() => steps.value.map((s) => s.id)],
  async (db, [stepIds]) => {
    if (!stepIds || stepIds.length === 0) return []
    return db.ApprovalWorkflowStepRole.where('stepId', stepIds).exec()
  },
)

const stepsWithoutAssignees = computed(() => {
  return steps.value.filter((step) => {
    const hasUsers = stepUsers.value.some((su) => su.stepId === step.id)
    const hasRoles = stepRoles.value.some((sr) => sr.stepId === step.id)
    return !hasUsers && !hasRoles
  })
})

watch(
  versions,
  (vs) => {
    if (vs?.length > 0 && !selectedVersionId.value) {
      selectedVersionId.value = vs.find((v) => v.statusId === 'DRAFT')?.id ?? vs[0].id
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

const currentVersion = computed(
  () => versions.value.find((v) => v.statusId === 'DRAFT') ?? versions.value[0] ?? null,
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
  if (!selectedVersion.value || !currentVersion.value) return false
  return selectedVersion.value.id !== currentVersion.value.id
})

const isDraftVersion = computed(() => selectedVersion.value?.statusId === 'DRAFT')

const canUpdate = computed(() => {
  if (!workflow.value || !selectedVersion.value) return false
  return isDraftVersion.value && isAllowed(['approvalWorkflows:update'])
})

const canCreateDraft = computed(() => {
  const haveDraftVersion = versions.value.some((v) => v.statusId === 'DRAFT')
  return isAllowed(['approvalWorkflows:update']) && !haveDraftVersion
})

// --- Handlers ---
const saving = ref(false)

const handlePublish = useLiveMutation(async (db) => {
  if (isViewingOldVersion.value) {
    toast.warning('Switch to the current version to make edits')
    return
  }
  if (!isDraftVersion.value) {
    toast.warning('This version is locked. Create a new draft to make changes.')
    return
  }

  // Validate each step has at least one role or reviewer
  if (stepsWithoutAssignees.value.length > 0) {
    toast.warning('Please assign at least one user or role to each step before publishing.')
    return
  }

  const allVersions = await db.ApprovalWorkflowVersion.where('workflowId', props.id).exec()
  const draftVersion = allVersions.find((v) => v.statusId === 'DRAFT')
  const publishedVersions = allVersions.filter((v) => v.statusId === 'PUBLISHED')
  if (!draftVersion) return

  // set statusId to PUBLISHED for the current version, and PBLISHED to RETIRED
  if (draftVersion.statusId === 'DRAFT') {
    draftVersion.statusId = 'PUBLISHED'
    await draftVersion.save()
    toast.success('Workflow published successfully')

    await Promise.all(
      publishedVersions.map(async (v) => {
        v.statusId = 'RETIRED'
        await v.save()
      }),
    )
  }
})

const creatingDraft = ref(false)

const createDraftMutation = useLiveMutation(async (db, { workflowId, majorBump }) => {
  const sourceVersion = await db.ApprovalWorkflowVersion.where('workflowId', workflowId)
    .orderBy('versionMajor', 'desc')
    .first()

  const currentVersionMajor = sourceVersion ? sourceVersion.versionMajor : 0
  const currentVersionMinor = sourceVersion ? sourceVersion.versionMinor : 0
  const newMajor = majorBump ? currentVersionMajor + 1 : currentVersionMajor
  const newMinor = majorBump ? 0 : currentVersionMinor + 1

  const newVersion = db.ApprovalWorkflowVersion.create({
    workflowId,
    versionMajor: newMajor,
    versionMinor: newMinor,
    statusId: 'DRAFT',
  })
  await newVersion.save()

  const sourceSteps = await db.ApprovalWorkflowStep.where(
    'workflowVersionId',
    sourceVersion?.id,
  ).exec()

  for (const step of sourceSteps) {
    const newStep = db.ApprovalWorkflowStep.create({
      workflowVersionId: newVersion.id,
      name: step.name,
      description: step.description,
      stepOrder: step.stepOrder,
      approvalRule: step.approvalRule,
      slaDays: step.slaDays,
      requireComments: step.requireComments,
      requireEsignature: step.requireEsignature,
    })
    await newStep.save()

    const users = await db.ApprovalWorkflowStepUser.where('stepId', step.id).exec()
    for (const su of users) {
      const newSu = db.ApprovalWorkflowStepUser.create({ stepId: newStep.id, userId: su.userId })
      await newSu.save()
    }

    const roles = await db.ApprovalWorkflowStepRole.where('stepId', step.id).exec()
    for (const sr of roles) {
      const newSr = db.ApprovalWorkflowStepRole.create({ stepId: newStep.id, roleId: sr.roleId })
      await newSr.save()
    }
  }

  return newVersion
})

async function handleCreateDraft(majorBump = false) {
  creatingDraft.value = true
  try {
    await createDraftMutation({ workflowId: props.id, majorBump })
    toast.success('New draft version created')
    selectedVersionId.value = null
  } catch {
    toast.error('Failed to create draft version')
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

const isFirstLoad = ref(true)

const debouncedSave = useDebounceFn(() => {
  if (!selectedVersion.value) return
  selectedVersion.value.save()
}, 1000)

watch(
  selectedVersion,
  () => {
    if (isFirstLoad.value) {
      isFirstLoad.value = false
      return
    }
    debouncedSave()
  },
  { deep: true },
)

watch(steps, () => {
  if (!steps.value.some((s) => s.id === selectedStepId.value)) {
    selectedStepId.value = steps.value[0]?.id ?? null
  }
})
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
        <BaseBreadcrumbs :items="breadcrumbItems" />
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
                    <span
                      v-if="version.id === currentVersion?.id"
                      class="tw:text-primary tw:font-bold tw:ml-1"
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
            <BaseButton :isLoading="saving" @click="handlePublish"> Publish </BaseButton>
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
        <BaseButton variant="text-link" @click="selectVersion(currentVersion)">
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

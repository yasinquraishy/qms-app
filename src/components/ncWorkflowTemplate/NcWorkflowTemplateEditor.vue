<script setup>
import { useDebounceFn } from '@vueuse/core'
import { IconHistory, IconLock, IconListDetails } from '@tabler/icons-vue'
import { isAllowed } from '@/utils/currentSession'
import { getCompanyPath } from '@/utils/routeHelpers'

const props = defineProps({
  id: { type: String, required: true },
  autoAddStage: { type: Boolean, default: true },
})

const toast = useToast()
const router = useRouter()

const selectedVersionId = ref(null)
const selectedStageId = ref(null)
const publishing = ref(false)
const creatingDraft = ref(false)

// --- Live data ---
const template = useLiveQueryWithDeps([() => props.id], async (db, [id]) =>
  db.NcWorkflowTemplate.findByPk(id),
)

const versions = useLiveQueryWithDeps(
  [() => props.id],
  async (db, [id]) => {
    if (!id) return []
    const vs = await db.NcWorkflowTemplateVersion.where('workflowTemplateId', id).exec()
    return vs.sort((a, b) => {
      if (a.versionMajor !== b.versionMajor) return b.versionMajor - a.versionMajor
      return b.versionMinor - a.versionMinor
    })
  },
  { initial: [] },
)

const stages = useLiveQueryWithDeps(
  [() => selectedVersionId.value],
  async (db, [versionId]) => {
    if (!versionId) return []
    return db.NcWorkflowTemplateStage.where('workflowTemplateVersionId', versionId).exec()
  },
  { initial: [] },
)

const stageUsers = useLiveQueryWithDeps(
  [() => stages.value.map((s) => s.id)],
  async (db, [stageIds]) => {
    if (!stageIds?.length) return []
    return db.NcWorkflowTemplateStageUser.where('stageId', stageIds).exec()
  },
  { initial: [] },
)

const stagesWithoutUsers = computed(() =>
  stages.value.filter((stage) => !stageUsers.value.some((su) => su.stageId === stage.id)),
)

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
    selectedStageId.value = null
  },
)

const selectedVersion = computed(
  () => versions.value?.find((v) => v.id === selectedVersionId.value) ?? null,
)

// --- Computed ---
const breadcrumbItems = computed(() => [
  { label: 'NC Workflow Templates', to: getCompanyPath('/nc-workflow-templates') },
  { label: template.value?.name || 'Edit Template' },
])

const versionLabel = computed(() => {
  const v = selectedVersion.value
  if (!v) return ''
  return v.versionLabel || `${v.versionMajor}.${v.versionMinor}`
})

const isViewingOldVersion = computed(() => selectedVersion.value?.statusId === 'RETIRED')
const isDraftVersion = computed(() => selectedVersion.value?.statusId === 'DRAFT')

const canUpdate = computed(() => {
  if (!template.value || !selectedVersion.value) return false
  return isDraftVersion.value && isAllowed(['ncWorkflow:update'])
})

const canCreateDraft = computed(() => {
  const haveDraft = versions.value.some((v) => v.statusId === 'DRAFT')
  return isAllowed(['ncWorkflow:update']) && !haveDraft
})

// --- Handlers ---
const handlePublish = useLiveMutation(async () => {
  if (!isDraftVersion.value) {
    toast.warning('Switch to a draft version to publish.')
    return
  }
  if (stagesWithoutUsers.value.length > 0) {
    toast.warning('Please assign at least one user to each stage before publishing.')
    return
  }
  publishing.value = true
  try {
    selectedVersion.value.statusId = 'PUBLISHED'
    await selectedVersion.value.save()
    toast.success('Template published successfully')
  } finally {
    publishing.value = false
  }
})

const createDraftMutation = useLiveMutation(async (db, { templateId, majorBump }) => {
  const sourceVersions = await db.NcWorkflowTemplateVersion.where(
    'workflowTemplateId',
    templateId,
    { force: true },
  ).exec()
  const sortedVersions = sourceVersions.sort((a, b) => {
    if (a.versionMajor !== b.versionMajor) return b.versionMajor - a.versionMajor
    return b.versionMinor - a.versionMinor
  })

  const sourceVersion = sortedVersions[0]
  const newMajor = majorBump
    ? (sourceVersion?.versionMajor ?? 0) + 1
    : (sourceVersion?.versionMajor ?? 1)
  const newMinor = majorBump ? 0 : (sourceVersion?.versionMinor ?? 0) + 1

  const newVersion = db.NcWorkflowTemplateVersion.create({
    workflowTemplateId: templateId,
    versionMajor: newMajor,
    versionMinor: newMinor,
    statusId: 'DRAFT',
  })
  await newVersion.save()

  const sourceStages = sourceVersion
    ? await db.NcWorkflowTemplateStage.where('workflowTemplateVersionId', sourceVersion.id).exec()
    : []

  for (const stage of sourceStages) {
    const newStage = db.NcWorkflowTemplateStage.create({
      workflowTemplateVersionId: newVersion.id,
      name: stage.name,
      description: stage.description,
      stageOrder: stage.stageOrder,
      formTemplateId: stage.formTemplateId,
      slaDays: stage.slaDays,
      requireEsignature: stage.requireEsignature,
    })
    await newStage.save()

    const users = await db.NcWorkflowTemplateStageUser.where('stageId', stage.id).exec()
    for (const su of users) {
      const newSu = db.NcWorkflowTemplateStageUser.create({
        stageId: newStage.id,
        userId: su.userId,
      })
      await newSu.save()
    }

    const outcomes = await db.NcWorkflowTemplateStageOnOutcome.where('stageId', stage.id).exec()
    for (const o of outcomes) {
      const newO = db.NcWorkflowTemplateStageOnOutcome.create({
        stageId: newStage.id,
        outcomeId: o.outcomeId,
      })
      await newO.save()
    }
  }

  // Second pass: clone send-back targets (need new stage IDs mapped from old)
  const newStages = await db.NcWorkflowTemplateStage.where(
    'workflowTemplateVersionId',
    newVersion.id,
  ).exec()

  // Build mapping: old stage order → new stage id
  const orderToNewId = {}
  for (const ns of newStages) {
    const os = sourceStages.find((s) => s.stageOrder === ns.stageOrder)
    if (os) orderToNewId[os.id] = ns.id
  }

  for (const stage of sourceStages) {
    const targets = await db.NcWorkflowTemplateStageSendBackTarget.where('stageId', stage.id).exec()
    for (const t of targets) {
      const newStageId = orderToNewId[stage.id]
      const newTargetId = orderToNewId[t.targetStageId]
      if (newStageId && newTargetId) {
        const newT = db.NcWorkflowTemplateStageSendBackTarget.create({
          stageId: newStageId,
          targetStageId: newTargetId,
        })
        await newT.save()
      }
    }
  }

  return newVersion
})

async function handleCreateDraft(majorBump = false) {
  creatingDraft.value = true
  try {
    await createDraftMutation({ templateId: props.id, majorBump })
    toast.success('New draft version created')
    selectedVersionId.value = null
  } catch {
    toast.error('Failed to create draft version')
  } finally {
    creatingDraft.value = false
  }
}

function goBack() {
  router.push(getCompanyPath('/nc-workflow-templates'))
}

function handleVersionSelect(version, close) {
  if (version.id !== selectedVersionId.value) {
    selectedVersionId.value = version.id
  }
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

watch(stages, () => {
  if (!stages.value.some((s) => s.id === selectedStageId.value)) {
    selectedStageId.value = stages.value[0]?.id ?? null
  }
})
</script>

<template>
  <div class="tw:flex tw:flex-col tw:h-full tw:overflow-hidden">
    <!-- Loading State -->
    <div v-if="!template" class="tw:flex tw:items-center tw:justify-center tw:h-full">
      <div
        class="tw:w-8 tw:h-8 tw:border-2 tw:border-primary tw:border-t-transparent tw:rounded-full tw:animate-spin"
      />
    </div>

    <!-- Content -->
    <template v-else>
      <SafeTeleport to="#main-header-title">
        <BaseBreadcrumbs :items="breadcrumbItems" />
      </SafeTeleport>

      <SafeTeleport to="#main-header-actions">
        <div class="tw:flex tw:items-center tw:gap-3">
          <!-- Version Selector -->
          <BasePopover placement="bottom-end">
            <template #button>
              <NcWorkflowTemplateVersionStatusBadgeById
                v-if="selectedVersion?.statusId"
                :statusId="selectedVersion.statusId"
                class="tw:ml-2"
                selectable
              >
                <template #icon>v{{ versionLabel }}</template>
              </NcWorkflowTemplateVersionStatusBadgeById>
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
                    <span>
                      v{{
                        version.versionLabel || `${version.versionMajor}.${version.versionMinor}`
                      }}
                    </span>
                    <NcWorkflowTemplateVersionStatusBadgeById
                      v-if="version.statusId"
                      :statusId="version.statusId"
                      class="tw:ml-1"
                    />
                    <span v-if="version.isCurrent" class="tw:text-primary tw:font-bold tw:ml-1">
                      (Current)
                    </span>
                  </div>
                </button>
              </div>
            </template>
          </BasePopover>

          <div class="tw:h-6 tw:w-px tw:bg-divider"></div>

          <BaseButton variant="outline" @click="goBack">Cancel</BaseButton>
          <template v-if="canUpdate">
            <BaseButton :isLoading="publishing" @click="handlePublish">Publish</BaseButton>
          </template>
          <BaseButton
            v-if="canCreateDraft"
            :isLoading="creatingDraft"
            @click="handleCreateDraft(false)"
          >
            Create New Draft
          </BaseButton>
        </div>
      </SafeTeleport>

      <!-- Version banners -->
      <div
        v-if="isViewingOldVersion"
        class="tw:bg-amber-50 tw:border-b tw:border-amber-200 tw:px-6 tw:py-3 tw:flex tw:items-center tw:gap-3"
      >
        <IconHistory :size="20" class="tw:text-amber-600" />
        <span class="tw:text-sm tw:text-amber-800 tw:font-medium">
          Viewing version v{{ versionLabel }} (read-only).
        </span>
      </div>
      <div
        v-else-if="selectedVersion?.statusId === 'PUBLISHED'"
        class="tw:bg-amber-50 tw:border-b tw:border-amber-200 tw:px-6 tw:py-3 tw:flex tw:items-center tw:gap-3"
      >
        <IconLock :size="20" class="tw:text-amber-600" />
        <span class="tw:text-sm tw:text-amber-800 tw:font-medium">
          This version is published and locked. Create a new draft to make changes.
        </span>
      </div>

      <!-- Global Settings -->
      <div class="tw:flex tw:flex-col tw:bg-main tw:border-b tw:border-divider tw:px-6 tw:py-4">
        <div class="tw:grid tw:grid-cols-1 tw:md:grid-cols-2 tw:gap-4">
          <div class="tw:flex-1">
            <label
              class="tw:block tw:text-xs tw:font-bold tw:text-secondary tw:uppercase tw:mb-1.5"
            >
              Template Name
            </label>
            <BaseTextInput
              v-model="template.name"
              placeholder="e.g. Standard NC Workflow"
              :disabled="!canUpdate"
            />
          </div>
          <div class="tw:flex-1">
            <label
              class="tw:block tw:text-xs tw:font-bold tw:text-secondary tw:uppercase tw:mb-1.5"
            >
              Description
            </label>
            <BaseTextInput
              v-model="template.description"
              placeholder="Describe the purpose of this template"
              :disabled="!canUpdate"
            />
          </div>
        </div>
      </div>

      <!-- Two-Pane Designer -->
      <div v-if="selectedVersion" class="tw:flex tw:flex-1 tw:overflow-hidden">
        <!-- Left Pane: Stage List -->
        <NcWorkflowTemplateStageList
          v-model:stageId="selectedStageId"
          :versionId="selectedVersionId"
          :canUpdate="canUpdate"
          :autoAddStage="autoAddStage"
        />

        <!-- Right Pane: Stage Editor -->
        <div class="tw:flex-1 tw:overflow-y-auto tw:bg-main tw:p-8">
          <div v-if="selectedStageId" class="tw:max-w-4xl tw:mx-auto tw:space-y-10">
            <NcWorkflowTemplateStageEditor
              :stageId="selectedStageId"
              :versionId="selectedVersionId"
              :canUpdate="canUpdate"
            />
          </div>

          <div
            v-else
            class="tw:flex tw:flex-col tw:items-center tw:justify-center tw:h-full tw:gap-4 tw:text-secondary"
          >
            <IconListDetails :size="48" class="tw:opacity-30" />
            <p class="tw:text-sm tw:font-medium">
              Select a stage from the left panel or use the 'Add Stage' button to get started.
            </p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { getCompanyPath } from '@/utils/routeHelpers.js'
import { isAllowed, currentSession } from '@/utils/currentSession.js'
import { useDocuments } from '@/composables/useDocuments.js'
import {
  IconNotes,
  IconSend,
  IconX,
  IconChecks,
  IconChevronDown,
  IconChartBar,
  IconFileDescription,
  IconMessage,
  IconTrash,
  IconArchive,
} from '@tabler/icons-vue'

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const toast = useToast()
const router = useRouter()
const { setEffective, cancelReview } = useDocuments()

// State
const document = useLiveQueryWithDeps([() => props.id], async (db, [id]) => {
  return db.Document.findByPk(id)
})
const versions = useLiveQueryWithDeps(
  [() => props.id],
  async (db, [id]) => {
    return db.DocumentVersion.where('documentId', id).orderBy('createdAt', 'desc').exec()
  },
  { initial: [], models: ['DocumentVersion', 'Document'] },
)

const latestVersion = useLiveQueryWithDeps([() => props.id], async (db, [documentId]) => {
  return db.DocumentVersion.where('documentId', documentId, { force: true })
    .orderBy('createdAt', 'desc')
    .first()
})

const selectedVersion = ref(null)
const showMessages = ref(false)

// Find an open task on any version of this document for the current user.
// Used to auto-select the version with the active task on first load.
const activeTaskVersionId = useLiveQueryWithDeps(
  [() => versions.value?.map((v) => v.id).join(','), () => currentSession.value?.userId],
  async (db, [versionIdsStr, userId]) => {
    if (!versionIdsStr || !userId) return null
    const versionIds = versionIdsStr.split(',')
    for (const versionId of versionIds) {
      const tasks = await db.TaskInstance.where('[entityType+entityId]', [
        'DocumentVersion',
        versionId,
      ]).exec()
      const match = tasks.find(
        (t) => t.assignedTo === userId && ['ASSIGNED', 'FORM_SUBMITTED'].includes(t.statusId),
      )
      if (match) return versionId
    }
    return null
  },
  { models: ['TaskInstance', 'DocumentVersion'] },
)

// Auto-select version when versions list changes.
// Prefer the version with an open task for the current user when available.
watch([versions, activeTaskVersionId], ([list, taskVersionId]) => {
  if (!list?.length) {
    selectedVersion.value = null
    return
  }
  const currentId = selectedVersion.value?.id
  const taskMatch = taskVersionId ? list.find((v) => v.id === taskVersionId) : null
  const currentMatch = currentId ? list.find((v) => v.id === currentId) : null
  selectedVersion.value = taskMatch ?? currentMatch ?? list[0]
})

const hasActiveTaskOnSelected = computed(
  () => !!activeTaskVersionId.value && selectedVersion.value?.id === activeTaskVersionId.value,
)

const breadcrumbs = computed(() => [
  { label: 'Documents', to: getCompanyPath('/documents') },
  { label: document.value ? document.value.title : 'Loading...' },
])

// workflow preview dialog state
const showPreviewDialog = ref(false)

// Permissions
const isOwner = computed(
  () => currentSession.value?.id === document.value?.userId || currentSession.value?.isOwner,
)

const canCreate = computed(() => {
  const allApproved = versions.value.every(
    (v) => v.statusId === 'APPROVED' || v.statusId === 'EFFECTIVE',
  )
  return isAllowed(['documents:create']) && document.value?.statusId !== 'ARCHIVED' && allApproved
})
const canEdit = computed(
  () => isAllowed(['documents:update']) && document.value?.statusId !== 'ARCHIVED',
)
const canDelete = computed(() => isAllowed(['documents:delete']) && isOwner.value)
const canSubmitForReview = computed(
  () =>
    canEdit.value &&
    isOwner.value &&
    ['DRAFT', 'REJECTED'].includes(selectedVersion.value?.statusId) &&
    !!document.value?.workflowVersionId &&
    document.value?.statusId !== 'ARCHIVED',
)
const canCancelReview = computed(
  () =>
    canEdit.value &&
    isOwner.value &&
    selectedVersion.value?.statusId === 'IN_REVIEW' &&
    selectedVersion.value?.workflowInstanceId,
)
const canSetEffective = computed(
  () => isOwner.value && selectedVersion.value?.statusId === 'APPROVED',
)

const versionLabel = computed(() => {
  const v = selectedVersion.value
  if (!v) return ''
  return v.versionLabel || `${v.versionMajor}.${v.versionMinor}`
})

// Methods
function selectVersion(version) {
  selectedVersion.value = version
}

function handleExport() {
  toast.notify({ type: 'info', message: 'Export functionality coming soon' })
}

function handleReports() {
  toast.notify({ type: 'info', message: 'Reports functionality coming soon' })
}

async function handleDeleteDocument() {
  await document.value.delete()
  router.push(getCompanyPath('/documents'))
}

async function handleDeleteVersion() {
  await selectedVersion.value.delete()
  // watch(versions) will auto-select the next available version
}

function handleSubmitForReview() {
  // open preview dialog instead of immediate confirmation
  showPreviewDialog.value = true
}

async function handleCancelReview() {
  const result = await cancelReview(props.id, selectedVersion.value.id)
  if (result?.error) {
    toast.error(result.error)
  } else {
    toast.success('Review cancelled successfully')
  }
}

async function handleSetEffective() {
  const result = await setEffective(props.id, selectedVersion.value.id)
  if (result.error) {
    toast.error(result.error)
  } else {
    toast.success('Document set as effective')
  }
}

const moreActionsItems = computed(() => {
  const items = []
  if (canDelete.value && selectedVersion.value?.statusId === 'DRAFT') {
    items.push({ name: 'Delete Version', icon: IconTrash, click: handleDeleteVersion })
  }
  if (canEdit.value) {
    items.push({ name: 'Archive Document', icon: IconArchive, click: handleDeleteDocument })
  }
  return items
})

async function createNewVersion() {
  const create = useLiveMutation(async (db) => {
    const latestVersionSections = latestVersion.value?.id
      ? await db.DocumentSection.where('documentVersionId', latestVersion.value.id).exec()
      : []

    const version = db.DocumentVersion.create({
      documentId: props.id,
      versionMajor: latestVersion.value ? latestVersion.value.versionMajor + 1 : 1,
      versionMinor: 0,
      statusId: 'DRAFT',
    })

    await version.save()

    await Promise.all(
      latestVersionSections.map((section) =>
        db.DocumentSection.create({
          documentId: version.documentId,
          documentVersionId: version.id,
          sectionType: section.sectionType,
          title: section.title,
          content: section.content,
          attachments: section.attachments,
          order: section.order,
        }).save(),
      ),
    )

    return version
  })

  selectedVersion.value = await create()
}
</script>

<template>
  <div class="tw:min-h-screen tw:bg-main">
    <SafeTeleport to="#main-header-title">
      <BaseBreadcrumbs :items="breadcrumbs" />
    </SafeTeleport>
    <!-- Loading State -->
    <div v-if="!document" class="tw:flex tw:items-center tw:justify-center tw:min-h-screen">
      <div
        class="tw:animate-spin tw:rounded-full tw:size-12 tw:border-4 tw:border-primary tw:border-t-transparent"
      />
    </div>

    <!-- Main Content -->
    <div v-else class="tw:flex tw:flex-col">
      <!-- Toolbar Section -->
      <div class="tw:bg-sidebar tw:border-b tw:border-divider tw:sticky tw:top-0 tw:z-10">
        <div
          class="tw:max-w-360 tw:mx-auto tw:px-6 tw:py-4 tw:flex tw:flex-wrap tw:items-center tw:justify-between tw:gap-4"
        >
          <div class="tw:flex tw:flex-wrap tw:items-center tw:gap-3">
            <TaskActionBar
              v-if="selectedVersion?.id"
              entityType="DocumentVersion"
              :entityId="selectedVersion.id"
            />

            <BaseButton v-if="canCreate" @click="createNewVersion">
              <IconNotes :size="20" class="tw:mr-1" />
              Create New Draft
            </BaseButton>

            <BaseButton v-if="canSubmitForReview" @click="handleSubmitForReview">
              <IconSend :size="20" class="tw:mr-1" />
              Submit For Review
            </BaseButton>

            <BaseButton v-if="canCancelReview" variant="danger" @click="handleCancelReview">
              <IconX :size="20" class="tw:mr-1" />
              Cancel Review
            </BaseButton>

            <BaseButton v-if="canSetEffective" @click="handleSetEffective">
              <IconChecks :size="20" class="tw:mr-1" />
              Set Effective
            </BaseButton>

            <BaseButton
              v-if="
                selectedVersion?.statusId === 'IN_REVIEW' &&
                canEdit &&
                selectedVersion.workflowInstanceId
              "
              variant="outline"
              @click="
                router.push(
                  getCompanyPath(`/workflow-instances/${selectedVersion.workflowInstanceId}`),
                )
              "
            >
              Show Workflow
            </BaseButton>

            <!-- Version Selector -->
            <div class="tw:relative">
              <BasePopover placement="bottom-start">
                <template #button>
                  <BaseButton variant="outline">
                    Version: {{ versionLabel }} ({{ selectedVersion?.statusId }})
                    <IconChevronDown :size="16" class="tw:ml-1" />
                  </BaseButton>
                </template>
                <template #content="{ close }">
                  <div class="tw:flex tw:flex-col tw:py-1 tw:min-w-48">
                    <div class="tw:text-xs tw:font-semibold tw:text-secondary tw:px-3 tw:py-1">
                      Document History
                    </div>
                    <button
                      v-for="version in versions"
                      :key="version.id"
                      class="tw:flex tw:w-full tw:items-start tw:px-3 tw:py-2 tw:text-sm tw:hover:bg-main-hover"
                      :class="
                        version.id === selectedVersion?.id
                          ? 'tw:text-primary tw:font-semibold'
                          : 'tw:text-on-sidebar'
                      "
                      @click="
                        () => {
                          selectVersion(version)
                          close()
                        }
                      "
                    >
                      Version
                      {{
                        version.versionLabel || `${version.versionMajor}.${version.versionMinor}`
                      }}
                      <span
                        v-if="version.statusId === 'EFFECTIVE'"
                        class="tw:text-primary tw:font-bold tw:ml-1"
                      >
                        (Current)
                      </span>
                      <span
                        v-else-if="version.statusId === 'DRAFT'"
                        class="tw:text-secondary tw:ml-1"
                      >
                        (Draft)
                      </span>
                    </button>
                  </div>
                </template>
              </BasePopover>
            </div>

            <div class="tw:h-6 tw:w-px tw:bg-divider tw:mx-2"></div>

            <BaseButton variant="secondary" @click="handleReports">
              <IconChartBar :size="20" class="tw:mr-1" />
              Reports
            </BaseButton>

            <BaseButton variant="secondary" @click="handleExport">
              <IconFileDescription :size="20" class="tw:mr-1" />
              Export
            </BaseButton>

            <BaseButton variant="secondary" @click="showMessages = true">
              <IconMessage :size="20" class="tw:mr-1" />
              Discussion
            </BaseButton>
          </div>

          <div class="tw:flex tw:items-center tw:gap-2">
            <BaseMenu
              v-if="document.statusId !== 'ARCHIVED' && (canEdit || canDelete)"
              :items="moreActionsItems"
            >
              <template #trigger>
                <BaseButton variant="outline">
                  More Actions
                  <IconChevronDown :size="16" class="tw:ml-1" />
                </BaseButton>
              </template>
            </BaseMenu>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <DocumentsMainContent
        :documentId="props.id"
        :versionId="selectedVersion?.id"
        :reviewMode="hasActiveTaskOnSelected"
      />

      <!-- Messages Drawer -->
      <DocumentsMessages v-model="showMessages" :documentId="props.id" />

      <DocumentWorkflowPreviewDialog
        v-model="showPreviewDialog"
        :documentId="props.id"
        :versionId="selectedVersion?.id"
      />
    </div>
  </div>
</template>

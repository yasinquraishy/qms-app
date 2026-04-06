<script setup>
import { useQuasar } from 'quasar'
import { useDocuments } from '@/composables/useDocuments.js'
import { provideDocumentMessages } from '@/composables/useDocumentMessages.js'
import { getCompanyPath } from '@/utils/routeHelpers.js'
import { isAllowed, currentSession } from '@/utils/currentSession.js'

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const router = useRouter()
const $q = useQuasar()
const {
  fetchDocument,
  fetchVersions,
  createVersion,
  deleteDocument,
  deleteVersion,
  cancelReview,
  setEffective,
} = useDocuments()

// State
const document = ref(null)
const versions = ref([])
const selectedVersion = ref(null)
const loading = ref(true)
const versionsLoading = ref(false)
const showWorkflowSidebar = ref(false)
const showMessages = ref(false)

provideDocumentMessages()
const breadcrumbs = computed(() => [
  { label: 'Documents', to: getCompanyPath('/documents') },
  { label: document.value ? document.value.title : 'Loading...' },
])

// Edit dialog state
const showEditDialog = ref(false)

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
    document.value?.workflowVersionId &&
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
async function loadDocument() {
  loading.value = true
  try {
    const result = await fetchDocument(props.id)
    if (result.error) {
      $q.notify({ type: 'negative', message: result.error })
      return
    }
    document.value = result.document
  } finally {
    loading.value = false
  }
}

async function loadVersions() {
  versionsLoading.value = true
  try {
    const result = await fetchVersions(props.id)
    if (result.error) {
      $q.notify({ type: 'negative', message: result.error })
      return
    }
    versions.value = result.versions || []
  } finally {
    versionsLoading.value = false
  }
}

function selectVersion(version) {
  selectedVersion.value = version
}

function handleExport() {
  $q.notify({ type: 'info', message: 'Export functionality coming soon' })
}

function handleReports() {
  $q.notify({ type: 'info', message: 'Reports functionality coming soon' })
}

// Edit dialog methods
function openEditDialog() {
  showEditDialog.value = true
}

async function handleDeleteDocument() {
  $q.dialog({
    title: 'Delete Document',
    message: 'Are you sure you want to delete this document? This action cannot be undone.',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const result = await deleteDocument(props.id)
    if (result.error) {
      $q.notify({ type: 'negative', message: result.error })
    } else {
      $q.notify({ type: 'positive', message: 'Document deleted successfully' })
      router.push(getCompanyPath('/documents'))
    }
  })
}

async function handleDeleteVersion() {
  if (!selectedVersion.value?.id) {
    $q.notify({ type: 'negative', message: 'No version selected' })
    return
  }

  if (selectedVersion.value.statusId !== 'DRAFT') {
    $q.notify({
      type: 'negative',
      message: 'Only draft versions can be deleted',
    })
    return
  }

  $q.dialog({
    title: 'Delete Version',
    message: `Are you sure you want to delete version ${versionLabel.value}? This action cannot be undone.`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const result = await deleteVersion(props.id, selectedVersion.value.id)
    if (result.error) {
      $q.notify({ type: 'negative', message: result.error })
    } else {
      $q.notify({ type: 'positive', message: 'Version deleted successfully' })
      await loadData()
      selectedVersion.value = null
    }
  })
}

async function onDocumentUpdated() {
  // Reload document after update
  await loadData()
}

function handleSubmitForReview() {
  // open preview dialog instead of immediate confirmation
  showPreviewDialog.value = true
}

async function handleCancelReview() {
  $q.dialog({
    title: 'Cancel Review',
    message:
      'Are you sure you want to cancel this review? The document version will return to draft status.',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const result = await cancelReview(selectedVersion.value.workflowInstanceId)
    if (result.error) {
      $q.notify({ type: 'negative', message: result.error })
    } else {
      $q.notify({ type: 'positive', message: 'Review cancelled successfully' })
      await loadData()
    }
  })
}

async function handleSetEffective() {
  if (!selectedVersion.value?.id) {
    $q.notify({ type: 'negative', message: 'No version selected' })
    return
  }

  $q.dialog({
    title: 'Set Version Effective',
    message:
      'Are you sure you want to make this version effective? This will mark the version as the current effective version.',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const result = await setEffective(props.id, selectedVersion.value.id)
    if (result.error) {
      $q.notify({ type: 'negative', message: result.error })
    } else {
      $q.notify({ type: 'positive', message: 'Version set to effective successfully' })
      await loadData()
    }
  })
}

async function createNewVersion() {
  if (!canCreate.value) return

  const result = await createVersion(props.id, { majorBump: true })
  if (result.error) {
    $q.notify({ type: 'negative', message: result.error })
    return
  }
  $q.notify({ type: 'positive', message: 'New version created successfully' })

  await loadData()
  await nextTick()
  const newVersion = versions.value.find((v) => v.id === result.version.id)
  if (newVersion) {
    selectVersion(newVersion)
  }
}

async function loadData() {
  await Promise.all([loadDocument(), loadVersions()])
  await nextTick()
  const findById = selectedVersion.value ? selectedVersion.value.id : versions.value[0]?.id
  const currentVersion = versions.value.find((v) => v.id === findById)
  selectVersion(currentVersion)
}

// Lifecycle
onMounted(() => {
  loadData()
})

watch(
  () => props.id,
  () => {
    loadData()
  },
)
</script>

<template>
  <div class="tw:min-h-screen tw:bg-main">
    <SafeTeleport to="#main-header-title">
      <WBreadcrumbs :items="breadcrumbs" />
    </SafeTeleport>
    <!-- Loading State -->
    <div v-if="loading" class="tw:flex tw:items-center tw:justify-center tw:min-h-screen">
      <QSpinner color="primary" size="50px" />
    </div>

    <!-- Main Content -->
    <div v-else-if="document" class="tw:flex tw:flex-col">
      <!-- Toolbar Section -->
      <div class="tw:bg-sidebar tw:border-b tw:border-divider tw:sticky tw:top-0 tw:z-10">
        <div
          class="tw:max-w-360 tw:mx-auto tw:px-6 tw:py-4 tw:flex tw:flex-wrap tw:items-center tw:justify-between tw:gap-4"
        >
          <div class="tw:flex tw:flex-wrap tw:items-center tw:gap-3">
            <WBtn
              v-if="canCreate"
              color="primary"
              unelevated
              class="tw:font-semibold"
              @click="createNewVersion"
            >
              <WIcon name="edit_note" class="tw:mr-2" size="20px" />
              Create New Draft
            </WBtn>

            <WBtn
              v-if="canSubmitForReview"
              color="positive"
              unelevated
              class="tw:font-semibold"
              @click="handleSubmitForReview"
            >
              <WIcon name="send" class="tw:mr-2" size="20px" />
              Submit For Review
            </WBtn>
            <DocumentWorkflowPreviewDialog
              v-model:show="showPreviewDialog"
              :documentId="props.id"
              @confirm="loadData"
            />

            <WBtn
              v-if="canCancelReview"
              color="negative"
              unelevated
              class="tw:font-semibold"
              @click="handleCancelReview"
            >
              <WIcon name="close" class="tw:mr-2" size="20px" />
              Cancel Review
            </WBtn>

            <WBtn
              v-if="canSetEffective"
              color="positive"
              unelevated
              class="tw:font-semibold"
              @click="handleSetEffective"
            >
              <WIcon name="verified" class="tw:mr-2" size="20px" />
              Set Effective
            </WBtn>

            <WBtn
              v-if="
                selectedVersion?.statusId === 'IN_REVIEW' &&
                canEdit &&
                selectedVersion.workflowInstanceId
              "
              color="positive"
              unelevated
              class="tw:font-semibold"
              :to="getCompanyPath(`/workflow-instances/${selectedVersion.workflowInstanceId}`)"
            >
              Show Workflow
            </WBtn>

            <!-- Version Selector -->
            <div class="tw:relative">
              <WBtn outline>
                Version: {{ versionLabel }} ({{ selectedVersion?.status?.name || 'Unknown' }})
                <WIcon name="expand_more" class="tw:ml-2" size="18px" />

                <!-- Version Dropdown -->
                <QMenu>
                  <QList class="tw:w-48">
                    <QItemLabel header class="ds-label-sm tw:text-secondary">
                      Document History
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
                          Version
                          {{
                            version.versionLabel ||
                            `${version.versionMajor}.${version.versionMinor}`
                          }}
                          <span
                            v-if="version.statusId === 'EFFECTIVE'"
                            class="tw:text-primary tw:font-bold"
                          >
                            (Current)
                          </span>
                          <span v-else-if="version.statusId === 'DRAFT'" class="tw:text-secondary">
                            (Draft)
                          </span>
                        </div>
                      </QItemSection>
                    </QItem>
                  </QList>
                </QMenu>
              </WBtn>
            </div>

            <div class="tw:h-6 tw:w-px tw:bg-divider tw:mx-2"></div>

            <WBtn flat class="tw:text-secondary" @click="handleReports">
              <WIcon name="bar_chart" class="tw:mr-1" size="20px" />
              Reports
            </WBtn>

            <WBtn flat class="tw:text-secondary" @click="handleExport">
              <WIcon name="notes" class="tw:mr-1" size="20px" />
              Export
            </WBtn>

            <WBtn flat class="tw:text-secondary" @click="showMessages = true">
              <WIcon name="forum" class="tw:mr-1" size="20px" />
              Discussion
            </WBtn>
          </div>

          <div class="tw:flex tw:items-center tw:gap-2">
            <WBtn v-if="document.statusId !== 'ARCHIVED' && (canEdit || canDelete)" flat>
              More Actions
              <WIcon name="more_vert" class="tw:ml-2" size="18px" />

              <QMenu>
                <QList>
                  <QItem v-if="canEdit" clickable @click="openEditDialog">
                    <QItemSection avatar>
                      <WIcon name="edit" size="20px" />
                    </QItemSection>
                    <QItemSection>Edit Properties</QItemSection>
                  </QItem>

                  <QItem
                    v-if="selectedVersion?.workflowInstanceId"
                    clickable
                    @click="showWorkflowSidebar = true"
                  >
                    <QItemSection avatar>
                      <WIcon name="account_tree" size="20px" />
                    </QItemSection>
                    <QItemSection>View Workflow</QItemSection>
                  </QItem>

                  <QItem
                    v-if="canDelete && selectedVersion?.statusId === 'DRAFT'"
                    clickable
                    @click="handleDeleteVersion"
                  >
                    <QItemSection avatar>
                      <WIcon name="delete" size="20px" />
                    </QItemSection>
                    <QItemSection>Delete Version</QItemSection>
                  </QItem>

                  <QItem v-if="canEdit" clickable @click="handleDeleteDocument">
                    <QItemSection avatar>
                      <WIcon name="archive" size="20px" class="tw:text-negative" />
                    </QItemSection>
                    <QItemSection class="tw:text-negative">Archive Document</QItemSection>
                  </QItem>
                </QList>
              </QMenu>
            </WBtn>
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <DocumentsMainContent
        :document="document"
        :currentVersion="selectedVersion"
        :canEdit="canEdit"
      />

      <!-- Workflow Overlay Sidebar -->
      <DocumentsWorkflowSidebar
        v-model="showWorkflowSidebar"
        :instanceId="selectedVersion?.workflowInstanceId"
      />

      <!-- Messages Drawer -->
      <DocumentsMessages v-model="showMessages" :documentId="props.id" />
    </div>

    <!-- Error State -->
    <div
      v-else
      class="tw:flex tw:flex-col tw:items-center tw:justify-center tw:min-h-screen tw:text-center"
    >
      <WIcon name="error_outline" size="64px" class="tw:text-secondary tw:mb-4" />
      <p class="tw:text-xl tw:font-semibold tw:text-on-main">Document not found</p>
      <WBtn color="primary" flat class="tw:mt-4" @click="router.push(getCompanyPath('/documents'))">
        Back to Documents
      </WBtn>
    </div>

    <!-- Edit Dialog -->
    <DocumentsEditDialog
      v-if="showEditDialog && document"
      v-model="showEditDialog"
      :document="document"
      :currentVersion="selectedVersion"
      @updated="onDocumentUpdated"
    />
  </div>
</template>

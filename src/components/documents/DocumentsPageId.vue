<script setup>
import { useQuasar } from 'quasar'
import { provideDocumentMessages } from '@/composables/useDocumentMessages.js'
import { getCompanyPath } from '@/utils/routeHelpers.js'
import { isAllowed, currentSession } from '@/utils/currentSession.js'

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const $q = useQuasar()
const router = useRouter()

// State
const document = useLiveQueryWithDeps([() => props.id], async (db, [id]) => {
  return db.Document.findByPk(id)
})
const versions = useLiveQueryWithDeps(
  [() => props.id],
  async (db, [id]) => {
    return db.DocumentVersion.where('documentId', id).orderBy('createdAt', 'desc').exec()
  },
  { initial: [] },
)

const latestVersion = useLiveQueryWithDeps([() => props.id], async (db, [id]) => {
  return db.DocumentVersion.where('documentId', id, { force: true })
    .orderBy('createdAt', 'desc')
    .first()
})

const selectedVersion = ref(null)
const showWorkflowSidebar = ref(false)
const showMessages = ref(false)

// Auto-select version when versions list changes
watch(versions, (list) => {
  if (!list?.length) {
    selectedVersion.value = null
    return
  }
  const currentId = selectedVersion.value?.id
  const found = currentId ? list.find((v) => v.id === currentId) : null
  selectedVersion.value = found ?? list[0]
})

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
  await document.value.delete()
  router.push(getCompanyPath('/documents'))
}

async function handleDeleteVersion() {
  await selectedVersion.value.delete()
  // watch(versions) will auto-select the next available version
}

function onDocumentUpdated() {
  // TODO: handle document updated
}

function handleSubmitForReview() {
  // open preview dialog instead of immediate confirmation
  showPreviewDialog.value = true
}

function handleCancelReview() {
  // TODO: cancel review
}

function handleSetEffective() {
  // TODO: set effective
}

async function createNewVersion() {
  const create = useLiveMutation(async (db) => {
    const version = db.DocumentVersion.create({
      documentId: props.id,
      versionMajor: latestVersion.value ? latestVersion.value.versionMajor + 1 : 1,
      versionMinor: 0,
      statusId: 'DRAFT',
    })

    await version.save()
    return version
  })

  selectedVersion.value = await create()
}
</script>

<template>
  <div class="tw:min-h-screen tw:bg-main">
    <SafeTeleport to="#main-header-title">
      <WBreadcrumbs :items="breadcrumbs" />
    </SafeTeleport>
    <!-- Loading State -->
    <div v-if="!document" class="tw:flex tw:items-center tw:justify-center tw:min-h-screen">
      <QSpinner color="primary" size="50px" />
    </div>

    <!-- Main Content -->
    <div v-else class="tw:flex tw:flex-col">
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
                Version: {{ versionLabel }} ({{ selectedVersion?.statusId }})
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

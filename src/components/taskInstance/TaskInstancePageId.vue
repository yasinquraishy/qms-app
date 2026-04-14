<script setup>
import { IconAlertCircle } from '@tabler/icons-vue'
import { getCompanyPath } from '@/utils/routeHelpers.js'

const props = defineProps({
  id: { type: String, required: true },
})

const router = useRouter()

// ─── SyncEngine Queries ───────────────────────────────────────────────────────
const taskInstance = useLiveQueryWithDeps([() => props.id], async (db, [id]) =>
  db.TaskInstance.findByPk(id),
)

// Resolve sourceId → ApprovalWorkflowInstanceStep (to get workflowInstanceId)
const instanceStep = useLiveQueryWithDeps(
  [() => taskInstance.value?.sourceId],
  async (db, [sourceId]) => {
    if (!sourceId) return null
    return db.ApprovalWorkflowInstanceStep.findByPk(sourceId)
  },
)

// Resolve the specific DocumentVersion locked for this workflow instance
const documentVersion = useLiveQueryWithDeps(
  [() => taskInstance.value?.entityId],
  async (db, [documentVersionId]) => {
    if (!documentVersionId) return null
    return await db.DocumentVersion.findByPk(documentVersionId)
  },
)

const document = useLiveQueryWithDeps(
  [() => documentVersion.value?.documentId],
  async (db, [documentId]) => {
    if (!documentId) return null
    return db.Document.findByPk(documentId)
  },
)

// ─── Computed ─────────────────────────────────────────────────────────────────
const loading = computed(() => taskInstance.value === undefined)

const breadcrumbs = computed(() => [
  { label: 'My Tasks', to: getCompanyPath('/task-instances') },
  { label: document.value?.title || 'Document' },
])

const canActOnStep = computed(() => taskInstance.value?.statusId === 'ASSIGNED')
</script>

<template>
  <div class="tw:min-h-screen tw:bg-main">
    <SafeTeleport to="#main-header-title">
      <BaseBreadcrumbs :items="breadcrumbs" />
    </SafeTeleport>

    <!-- Loading -->
    <div
      v-if="loading"
      class="tw:flex tw:items-center tw:justify-center tw:min-h-[60vh] tw:text-secondary"
    >
      <div
        class="tw:animate-spin tw:rounded-full tw:h-10 tw:w-10 tw:border-4 tw:border-primary tw:border-t-transparent"
      />
    </div>

    <!-- Main Content -->
    <template v-else-if="taskInstance">
      <SafeTeleport to="#main-header-actions">
        <div v-if="canActOnStep" class="tw:flex tw:items-center tw:gap-2">
          <ApprovalWorkflowInstanceApproverAction
            action="APPROVE"
            :workflowInstanceId="instanceStep?.workflowInstanceId"
            :instanceStepId="instanceStep?.id"
          />
          <ApprovalWorkflowInstanceApproverAction
            action="REJECT"
            :workflowInstanceId="instanceStep?.workflowInstanceId"
            :instanceStepId="instanceStep?.id"
          />
        </div>
        <TaskInstanceStatusBadgeById v-else :statusId="taskInstance.statusId" />
      </SafeTeleport>

      <DocumentsMainContent
        v-if="document"
        :documentId="document.id"
        :versionId="documentVersion?.id"
        :reviewMode="canActOnStep"
      />
    </template>

    <!-- Not Found -->
    <div
      v-else
      class="tw:flex tw:flex-col tw:items-center tw:justify-center tw:min-h-[60vh] tw:text-center"
    >
      <IconAlertCircle :size="64" class="tw:text-secondary tw:mb-4" />
      <p class="tw:text-xl tw:font-semibold tw:text-on-main">Task not found</p>
      <button
        class="tw:mt-4 tw:text-primary tw:hover:underline tw:text-sm"
        @click="router.push(getCompanyPath('/task-instances'))"
      >
        Back to My Tasks
      </button>
    </div>
  </div>
</template>

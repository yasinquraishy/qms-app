<script setup>
import { useQuasar } from 'quasar'
import { useTaskInstances } from '@/composables/useTaskInstances.js'
import { getCompanyPath } from '@/utils/routeHelpers.js'

const props = defineProps({
  id: { type: String, required: true },
})

const router = useRouter()
const $q = useQuasar()
const { loading, fetchInstance } = useTaskInstances()

// ─── State ────────────────────────────────────────────────────────────────────
const instance = ref(null)

// ─── Computed ─────────────────────────────────────────────────────────────────
const breadcrumbs = computed(() => [
  { label: 'My Tasks', to: getCompanyPath('/task-instances') },
  { label: instance.value?.document?.title || 'Document' },
])

const canActOnStep = computed(() => instance.value?.statusId === 'ASSIGNED')

// ─── Actions ──────────────────────────────────────────────────────────────────
async function loadData() {
  const result = await fetchInstance(props.id)
  if (result.error) {
    $q.notify({ type: 'negative', message: result.error })
    return
  }
  instance.value = result.taskInstance
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(() => {
  loadData()
})

provide('approverAction', loadData)
</script>

<template>
  <div class="tw:min-h-screen tw:bg-main">
    <SafeTeleport to="#main-header-title">
      <WBreadcrumbs :items="breadcrumbs" />
    </SafeTeleport>

    <!-- Loading -->
    <div v-if="loading" class="tw:flex tw:items-center tw:justify-center tw:min-h-[60vh]">
      <QSpinner color="primary" size="50px" />
    </div>

    <!-- Main Content -->
    <template v-else-if="instance">
      <SafeTeleport to="#main-header-actions">
        <div v-if="canActOnStep" class="tw:flex tw:items-center tw:gap-2">
          <ApprovalWorkflowInstanceApproverAction
            action="APPROVE"
            :activeStep="instance.workflowStep"
            @done="loadData"
          />
          <ApprovalWorkflowInstanceApproverAction
            action="REJECT"
            :activeStep="instance.workflowStep"
            @done="loadData"
          />
        </div>
        <WStatusBadge v-else :status="instance.statusId" variant="task" showIcon />
      </SafeTeleport>

      <DocumentsMainContent
        :document="instance.document"
        :currentVersion="instance.document?.latestVersion"
        :canEdit="false"
        :reviewMode="canActOnStep"
      />
    </template>

    <!-- Not Found -->
    <div
      v-else
      class="tw:flex tw:flex-col tw:items-center tw:justify-center tw:min-h-[60vh] tw:text-center"
    >
      <WIcon name="error_outline" size="64px" class="tw:text-secondary tw:mb-4" />
      <p class="tw:text-xl tw:font-semibold tw:text-on-main">Task not found</p>
      <WBtn
        color="primary"
        flat
        class="tw:mt-4"
        @click="router.push(getCompanyPath('/task-instances'))"
      >
        Back to My Tasks
      </WBtn>
    </div>
  </div>
</template>

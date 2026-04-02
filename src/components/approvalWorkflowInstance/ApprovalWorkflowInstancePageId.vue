<script setup>
import { useQuasar } from 'quasar'
import { useApprovalWorkflowInstances } from '@/composables/useApprovalWorkflowInstances.js'
import { getCompanyPath } from '@/utils/routeHelpers.js'

const props = defineProps({
  id: { type: String, required: true },
})

const router = useRouter()
const $q = useQuasar()
const { loading, fetchInstance } = useApprovalWorkflowInstances()

// ─── State ────────────────────────────────────────────────────────────────────
const instance = ref(null)

// ─── Computed ─────────────────────────────────────────────────────────────────
const documentId = computed(() => instance.value?.resource?.id)

const breadcrumbs = computed(() => [
  { label: 'Approvals Inbox', to: getCompanyPath('/workflow-instances') },
  {
    label: instance.value?.resource?.title || 'Document',
    to: documentId.value ? getCompanyPath(`/documents/${documentId.value}`) : undefined,
  },
  { label: 'Approval' },
])

// ─── Actions ──────────────────────────────────────────────────────────────────
async function loadData() {
  const instanceResult = await fetchInstance(props.id)
  if (instanceResult.error) {
    $q.notify({ type: 'negative', message: instanceResult.error })
    return
  }
  instance.value = instanceResult.workflowInstance
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
    <ApprovalWorkflowInstanceDetailView v-else-if="instance" :instance="instance" />

    <!-- Not Found -->
    <div
      v-else
      class="tw:flex tw:flex-col tw:items-center tw:justify-center tw:min-h-[60vh] tw:text-center"
    >
      <WIcon name="error_outline" size="64px" class="tw:text-secondary tw:mb-4" />
      <p class="tw:text-xl tw:font-semibold tw:text-on-main">Approval instance not found</p>
      <WBtn color="primary" flat class="tw:mt-4" @click="router.push(getCompanyPath('/documents'))">
        Back to Documents
      </WBtn>
    </div>
  </div>
</template>

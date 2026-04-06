<script setup>
import { getCompanyPath } from '@/utils/routeHelpers.js'
import { useApprovalWorkflowInstances } from '@/composables/useApprovalWorkflowInstances.js'
import { DateTime } from 'luxon'

const props = defineProps({
  instance: { type: Object, required: true },
})

const router = useRouter()
const { fetchInstanceAuditLogs } = useApprovalWorkflowInstances()

// ─── State ────────────────────────────────────────────────────────────────────
const auditLogs = ref([])

// ─── Computed ─────────────────────────────────────────────────────────────────
const doc = computed(() => props.instance?.resource)
const workflowVersion = computed(() => props.instance?.workflowVersion)
const steps = computed(() => props.instance?.steps || [])
const statusLabel = computed(() => props.instance?.status?.name || 'Unknown')

const statusColor = computed(() => {
  const id = props.instance?.statusId
  if (id === 'COMPLETED') return 'emerald'
  if (id === 'REJECTED') return 'red'
  if (id === 'CHANGES_REQUESTED') return 'orange'
  return 'amber'
})

const progressPercent = computed(() => {
  if (!steps.value.length) return 0
  const completed = steps.value.filter((s) => s.statusId === 'APPROVED').length
  return Math.round((completed / steps.value.length) * 100)
})

const completedSteps = computed(() => steps.value.filter((s) => s.statusId === 'APPROVED').length)

const elapsedTime = computed(() => {
  if (!props.instance?.startedAt) return 'N/A'
  const start = props.instance.startedAt
  const end = props.instance.completedAt || DateTime.now()
  const diff = end.diff(start, ['hours', 'minutes'])
  const hours = Math.floor(diff.hours)
  const minutes = Math.floor(diff.minutes)
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
})

// ─── Actions ──────────────────────────────────────────────────────────────────
async function loadAuditLogs() {
  if (!props.instance?.resource?.id) return

  const result = await fetchInstanceAuditLogs(props.instance.resource.id)
  if (!result.error) {
    auditLogs.value = result.auditLogs
  }
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────
watch(
  () => props.instance?.resource?.id,
  (newDocId) => {
    if (newDocId) {
      loadAuditLogs()
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="tw:max-w-350 tw:mx-auto tw:w-full tw:p-4 tw:lg:p-8">
    <div class="tw:flex tw:flex-col tw:lg:grid tw:lg:grid-cols-12 tw:gap-8">
      <!-- ─── Main Column ─────────────────────────────────────────────── -->
      <div class="tw:lg:col-span-8 tw:space-y-6">
        <ApprovalWorkflowInstanceDocumentSummary
          :doc="doc"
          :workflowVersion="workflowVersion"
          :statusLabel="statusLabel"
          :statusColor="statusColor"
          @viewDocument="router.push(getCompanyPath(`/documents/${doc?.id}`))"
        />

        <ApprovalWorkflowInstanceTimeline :steps="steps" />
      </div>

      <!-- ─── Sidebar Column ──────────────────────────────────────────── -->
      <div class="tw:lg:col-span-4 tw:space-y-6">
        <ApprovalWorkflowInstanceHealthCard
          :progressPercent="progressPercent"
          :elapsedTime="elapsedTime"
          :completedSteps="completedSteps"
          :totalSteps="steps.length"
        />

        <ApprovalWorkflowInstanceAuditTrail :auditLogs="auditLogs" />
      </div>
    </div>
  </div>
</template>

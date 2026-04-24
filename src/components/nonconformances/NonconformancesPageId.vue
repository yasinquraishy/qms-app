<script setup>
import { IconChevronRight, IconAlertTriangle } from '@tabler/icons-vue'
import { currentSession } from '@/utils/currentSession.js'
import { getCompanyPath } from '@/utils/routeHelpers.js'
import { DateTime } from 'luxon'

const props = defineProps({
  id: { type: String, required: true },
})

const router = useRouter()

const nc = useLiveQueryWithDeps([() => props.id], async (db, [id]) =>
  db.Nonconformance.findByPk(id),
)

const loading = computed(() => nc.value === undefined)

const breadcrumbs = computed(() => [
  { label: 'Nonconformances', to: getCompanyPath('/nonconformances') },
  { label: nc.value?.ncNumber || nc.value?.title || 'Loading…' },
])

// Status workflow progression for the strip
const STATUS_ORDER = [
  { id: 'DRAFT', label: 'Draft' },
  { id: 'UNDER_REVIEW', label: 'Review' },
  { id: 'UNDER_INVESTIGATION', label: 'Investigation' },
  { id: 'PENDING_DISPOSITION', label: 'Pending disposition' },
  { id: 'CLOSED', label: 'Closed' },
]

function stepState(stepId) {
  if (!nc.value) return 'todo'
  const currentIdx = STATUS_ORDER.findIndex((s) => s.id === nc.value.statusId)
  const stepIdx = STATUS_ORDER.findIndex((s) => s.id === stepId)
  if (stepIdx < currentIdx) return 'done'
  if (stepIdx === currentIdx) return 'current'
  return 'todo'
}

// Inline editing state
const dispositionForm = ref({
  dispositionTypeId: null,
  capaRequired: null,
  dispositionNotes: '',
})

watch(
  nc,
  (val) => {
    if (val) {
      dispositionForm.value = {
        dispositionTypeId: val.dispositionTypeId,
        capaRequired: val.capaRequired,
        dispositionNotes: val.dispositionNotes || '',
      }
    }
  },
  { immediate: true },
)

const saving = ref(false)
const saveError = ref(null)

async function handleRecordDisposition() {
  if (!nc.value) return
  if (!dispositionForm.value.dispositionTypeId) {
    saveError.value = 'Disposition is required'
    return
  }
  if (dispositionForm.value.capaRequired === null) {
    saveError.value = 'CAPA decision is required'
    return
  }
  if (!dispositionForm.value.dispositionNotes) {
    saveError.value = 'Disposition notes are required'
    return
  }

  saving.value = true
  saveError.value = null
  try {
    nc.value.dispositionTypeId = dispositionForm.value.dispositionTypeId
    nc.value.capaRequired = dispositionForm.value.capaRequired
    nc.value.dispositionNotes = dispositionForm.value.dispositionNotes
    nc.value.statusId = 'CLOSED'
    nc.value.closedAt = DateTime.now()
    nc.value.updatedBy = currentSession.value?.userId || ''
    await nc.value.save()
    router.push(getCompanyPath('/nonconformances'))
  } catch (e) {
    saveError.value = e.message || 'Failed to record disposition'
  } finally {
    saving.value = false
  }
}

async function handleSubmitForReview() {
  if (!nc.value) return
  saving.value = true
  try {
    nc.value.statusId = 'UNDER_REVIEW'
    nc.value.updatedBy = currentSession.value?.userId || ''
    await nc.value.save()
  } finally {
    saving.value = false
  }
}

async function handleSendBack() {
  if (!nc.value) return
  saving.value = true
  try {
    nc.value.statusId = 'UNDER_INVESTIGATION'
    nc.value.updatedBy = currentSession.value?.userId || ''
    await nc.value.save()
  } finally {
    saving.value = false
  }
}

const isOverdue = computed(() => {
  if (!nc.value?.dueDate) return false
  if (['CLOSED', 'VOID'].includes(nc.value.statusId)) return false
  return nc.value.dueDate < new Date().toISOString().slice(0, 10)
})

const workflowInstance = useLiveQueryWithDeps([() => props.id], async (db, [id]) => {
  const results = await db.WorkflowInstance.where('[resourceType+resourceId]', [
    'Nonconformance',
    id,
  ]).exec()
  return results.find((i) => i.statusId === 'IN_PROGRESS') || results[0] || null
})
</script>

<template>
  <div class="tw:flex tw:flex-col tw:h-full">
    <SafeTeleport to="#main-header-title">
      <BaseBreadcrumbs :items="breadcrumbs" />
    </SafeTeleport>

    <SafeTeleport to="#main-header-actions">
      <BaseButton
        v-if="nc?.statusId === 'DRAFT'"
        variant="primary"
        :disabled="saving"
        @click="handleSubmitForReview"
        >Submit for review</BaseButton
      >
    </SafeTeleport>

    <div v-if="loading" class="tw:flex tw:items-center tw:justify-center tw:h-full">
      <div
        class="tw:animate-spin tw:rounded-full tw:w-8 tw:h-8 tw:border-2 tw:border-primary tw:border-t-transparent"
      />
    </div>

    <div v-else-if="nc" class="tw:overflow-y-auto tw:flex-1">
      <div class="tw:p-5 tw:flex tw:flex-col tw:gap-4">
        <!-- Workflow strip -->
        <div
          class="tw:bg-white tw:border tw:border-divider tw:rounded-lg tw:px-5 tw:py-3 tw:flex tw:items-center tw:overflow-x-auto tw:gap-0"
        >
          <template v-for="(step, i) in STATUS_ORDER" :key="step.id">
            <div
              class="tw:px-3 tw:py-1.5 tw:rounded-md tw:text-xs tw:font-medium tw:whitespace-nowrap tw:shrink-0"
              :class="{
                'tw:bg-green-100 tw:text-green-700': stepState(step.id) === 'done',
                'tw:bg-primary tw:text-white': stepState(step.id) === 'current',
                'tw:bg-main-hover tw:text-secondary': stepState(step.id) === 'todo',
              }"
            >
              {{ step.label }}
            </div>
            <IconChevronRight
              v-if="i < STATUS_ORDER.length - 1"
              :size="14"
              class="tw:text-secondary tw:shrink-0 tw:mx-1"
            />
          </template>
        </div>

        <!-- 2-column layout -->
        <div class="tw:grid tw:grid-cols-1 tw:lg:grid-cols-[1fr_280px] tw:gap-4 tw:items-start">
          <!-- Left column -->
          <div class="tw:flex tw:flex-col tw:gap-4">
            <!-- NC Details card -->
            <div class="tw:bg-white tw:border tw:border-divider tw:rounded-lg tw:p-5">
              <div
                class="tw:text-xs tw:font-semibold tw:text-secondary tw:uppercase tw:tracking-wider tw:pb-3 tw:border-b tw:border-divider tw:mb-4"
              >
                NC Details
              </div>
              <div class="tw:text-base tw:font-semibold tw:text-on-main tw:mb-2">
                {{ nc.title }}
              </div>
              <p
                v-if="nc.description"
                class="tw:text-sm tw:text-secondary tw:mb-4 tw:leading-relaxed"
              >
                {{ nc.description }}
              </p>
              <div class="tw:grid tw:grid-cols-3 tw:gap-3">
                <div class="tw:flex tw:flex-col tw:gap-1">
                  <div class="tw:text-xs tw:text-secondary">Severity</div>
                  <NcSeverityBadgeById :severityId="nc.severityId" />
                </div>
                <div class="tw:flex tw:flex-col tw:gap-1">
                  <div class="tw:text-xs tw:text-secondary">Type</div>
                  <NcTypeBadgeById :typeId="nc.typeId" />
                </div>
                <div class="tw:flex tw:flex-col tw:gap-1">
                  <div class="tw:text-xs tw:text-secondary">Source</div>
                  <NcSourceBadgeById :sourceId="nc.sourceId" />
                </div>
                <div class="tw:flex tw:flex-col tw:gap-1">
                  <div class="tw:text-xs tw:text-secondary">Detected</div>
                  <span class="tw:text-sm tw:font-medium">
                    {{ nc.detectedAt.formatDate('date') || '—' }}
                  </span>
                </div>
                <div v-if="nc.productId" class="tw:flex tw:flex-col tw:gap-1">
                  <div class="tw:text-xs tw:text-secondary">Product</div>
                  <span class="tw:text-sm tw:font-medium">{{ nc.productId }}</span>
                </div>
                <div v-if="nc.qtyAffected" class="tw:flex tw:flex-col tw:gap-1">
                  <div class="tw:text-xs tw:text-secondary">Qty affected</div>
                  <span class="tw:text-sm tw:font-medium">
                    {{ nc.qtyAffected }} {{ nc.unitOfMeasure }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Investigation card -->
            <div class="tw:bg-white tw:border tw:border-divider tw:rounded-lg tw:p-5">
              <div
                class="tw:text-xs tw:font-semibold tw:text-secondary tw:uppercase tw:tracking-wider tw:pb-3 tw:border-b tw:border-divider tw:mb-4"
              >
                Investigation findings
              </div>
              <div v-if="nc.rootCauseCategoryId" class="tw:mb-3">
                <div class="tw:text-xs tw:text-secondary tw:mb-1">Root cause category</div>
                <BaseBadge class="tw:bg-amber-100 tw:text-amber-700">
                  {{ nc.rootCauseCategoryId }}
                </BaseBadge>
              </div>
              <div v-if="nc.rootCause" class="tw:mb-3">
                <div class="tw:text-xs tw:text-secondary tw:mb-1">Root cause</div>
                <p class="tw:text-sm tw:text-on-main tw:leading-relaxed">{{ nc.rootCause }}</p>
              </div>
              <div
                v-if="!nc.rootCauseCategoryId && !nc.rootCause"
                class="tw:text-sm tw:text-secondary tw:italic"
              >
                No investigation findings recorded yet.
              </div>
            </div>

            <!-- Disposition card -->
            <div class="tw:bg-white tw:border tw:border-divider tw:rounded-lg tw:p-5">
              <div
                class="tw:text-xs tw:font-semibold tw:text-secondary tw:uppercase tw:tracking-wider tw:pb-3 tw:border-b tw:border-divider tw:mb-4"
              >
                Disposition decision
              </div>

              <div
                v-if="saveError"
                class="tw:bg-red-50 tw:border tw:border-red-200 tw:text-red-700 tw:rounded-md tw:p-2 tw:text-sm tw:mb-3"
              >
                {{ saveError }}
              </div>

              <div class="tw:grid tw:grid-cols-2 tw:gap-3 tw:mb-4">
                <div class="tw:flex tw:flex-col tw:gap-1">
                  <label class="tw:text-sm tw:font-medium tw:text-secondary">
                    Disposition <span class="tw:text-red-500">*</span>
                  </label>
                  <NcDispositionTypeSelectMenu
                    v-model="dispositionForm.dispositionTypeId"
                    :required="false"
                  />
                </div>
                <div class="tw:flex tw:flex-col tw:gap-1">
                  <label class="tw:text-sm tw:font-medium tw:text-secondary">
                    CAPA required? <span class="tw:text-red-500">*</span>
                  </label>
                  <div class="tw:flex tw:gap-2">
                    <BaseButton
                      class="tw:flex-1 tw:justify-center"
                      :variant="dispositionForm.capaRequired === true ? 'primary' : 'outline'"
                      @click="dispositionForm.capaRequired = true"
                      >Yes</BaseButton
                    >
                    <BaseButton
                      class="tw:flex-1 tw:justify-center"
                      :variant="dispositionForm.capaRequired === false ? 'primary' : 'outline'"
                      @click="dispositionForm.capaRequired = false"
                      >No</BaseButton
                    >
                  </div>
                </div>
                <div class="tw:flex tw:flex-col tw:gap-1 tw:col-span-2">
                  <label class="tw:text-sm tw:font-medium tw:text-secondary">
                    Disposition notes <span class="tw:text-red-500">*</span>
                  </label>
                  <BaseTextarea
                    v-model="dispositionForm.dispositionNotes"
                    placeholder="Justify your disposition decision and CAPA choice…"
                    :rows="3"
                  />
                </div>
              </div>

              <div class="tw:flex tw:gap-2 tw:pt-3 tw:border-t tw:border-divider">
                <BaseButton
                  variant="primary"
                  :disabled="saving || nc.statusId === 'CLOSED'"
                  @click="handleRecordDisposition"
                >
                  Record disposition &amp; close NC →
                </BaseButton>
                <BaseButton :disabled="saving" @click="handleSendBack">
                  Send back to investigation
                </BaseButton>
              </div>
            </div>
          </div>

          <!-- Right column -->
          <div class="tw:flex tw:flex-col tw:gap-3">
            <!-- Overview side card -->
            <div class="tw:bg-white tw:border tw:border-divider tw:rounded-lg tw:p-4">
              <div
                class="tw:text-xs tw:font-semibold tw:text-secondary tw:uppercase tw:tracking-wider tw:pb-2 tw:border-b tw:border-divider tw:mb-3"
              >
                Overview
              </div>
              <div class="tw:flex tw:flex-col tw:divide-y tw:divide-border">
                <div class="tw:flex tw:justify-between tw:items-center tw:py-2 tw:border-divider">
                  <span class="tw:text-xs tw:text-secondary">NC number</span>
                  <span class="tw:text-xs tw:font-mono tw:font-medium">{{
                    nc.ncNumber || '—'
                  }}</span>
                </div>
                <div class="tw:flex tw:justify-between tw:items-center tw:py-2 tw:border-divider">
                  <span class="tw:text-xs tw:text-secondary">Status</span>
                  <NcStatusBadgeById :statusId="nc.statusId" />
                </div>
                <div class="tw:flex tw:justify-between tw:items-center tw:py-2 tw:border-divider">
                  <span class="tw:text-xs tw:text-secondary">Severity</span>
                  <NcSeverityBadgeById :severityId="nc.severityId" />
                </div>
                <div class="tw:flex tw:justify-between tw:items-center tw:py-2 tw:border-divider">
                  <span class="tw:text-xs tw:text-secondary">Owner</span>
                  <UserBadgeById v-if="nc.ownerId" :userId="nc.ownerId" />
                  <span v-else class="tw:text-sm tw:text-secondary">—</span>
                </div>
                <div class="tw:flex tw:justify-between tw:items-center tw:py-2 tw:border-divider">
                  <span class="tw:text-xs tw:text-secondary">Detected</span>
                  <span class="tw:text-sm tw:font-medium">{{
                    nc.detectedAt ? nc.detectedAt.formatDate('date') : '—'
                  }}</span>
                </div>
                <div class="tw:flex tw:justify-between tw:items-center tw:py-2 tw:border-divider">
                  <span class="tw:text-xs tw:text-secondary">Due date</span>
                  <span
                    class="tw:text-sm tw:font-medium tw:flex tw:items-center tw:gap-1 tw:flex-nowrap"
                    :class="isOverdue ? 'tw:text-red-600' : ''"
                  >
                    <span>{{ nc.dueDate ? nc.dueDate.formatDate('date') : '—' }}</span>
                    <IconAlertTriangle v-if="isOverdue" :size="16" class="tw:text-red-600" />
                  </span>
                </div>
                <div
                  v-if="nc.supplierId"
                  class="tw:flex tw:justify-between tw:items-center tw:py-2"
                >
                  <span class="tw:text-xs tw:text-secondary">Supplier</span>
                  <SupplierBadgeById :supplierId="nc.supplierId" />
                </div>
                <div class="tw:flex tw:justify-between tw:items-center tw:py-2">
                  <span class="tw:text-xs tw:text-secondary">CAPA</span>
                  <span
                    class="tw:text-sm tw:font-medium"
                    :class="nc.capaRequired === null ? 'tw:text-secondary tw:italic' : ''"
                  >
                    {{
                      nc.capaRequired === true
                        ? 'Required'
                        : nc.capaRequired === false
                          ? 'Not required'
                          : 'Not yet decided'
                    }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Workflow panel -->
            <div
              v-if="nc.workflowVersionId || workflowInstance"
              class="tw:bg-white tw:border tw:border-divider tw:rounded-lg tw:p-4"
            >
              <div
                class="tw:text-xs tw:font-semibold tw:text-secondary tw:uppercase tw:tracking-wider tw:pb-2 tw:border-b tw:border-divider tw:mb-3"
              >
                Approval workflow
              </div>

              <!-- Active workflow instance -->
              <div v-if="workflowInstance">
                <WorkflowInstanceStatusBadgeById :statusId="workflowInstance.statusId" showDot />
                <RouterLink
                  class="tw:mt-3 tw:flex tw:items-center tw:text-sm tw:text-primary tw:font-medium tw:hover:underline"
                  :to="getCompanyPath(`/workflow-instances/${workflowInstance.id}`)"
                >
                  View approval details →
                </RouterLink>
              </div>

              <!-- Not yet submitted -->
              <div v-else-if="nc.workflowVersionId" class="tw:text-sm tw:text-secondary">
                Approval workflow assigned but not yet submitted.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <BaseEmptyState
      v-else
      title="NC not found"
      description="This nonconformance could not be found."
    />
  </div>
</template>

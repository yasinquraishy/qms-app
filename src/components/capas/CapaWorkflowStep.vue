<script setup>
import { IconDeviceFloppy, IconSend } from '@tabler/icons-vue'
import DynamicForm from '@/components/form/DynamicForm.js'
import FormSchemaReadonlyView from '@/components/form/FormSchemaReadonlyView.vue'
import { currentSession } from '@/utils/currentSession.js'
import { db } from '@models/index'
import { DateTime } from 'luxon'

const props = defineProps({
  instanceStepId: { type: String, required: true },
  capaId: { type: String, required: true },
})

const toast = useToast()
const currentUserId = computed(() => currentSession.value?.userId)

const capa = useLiveQueryWithDeps([() => props.capaId], async (db, [id]) =>
  id ? db.Capa.findByPk(id) : null,
)

const instanceStep = useLiveQueryWithDeps([() => props.instanceStepId], async (db, [id]) =>
  id ? db.WorkflowInstanceStep.findByPk(id) : null,
)

const stepDefinition = useLiveQueryWithDeps(
  [() => instanceStep.value?.stepId],
  async (db, [stepId]) => (stepId ? db.WorkflowStep.findByPk(stepId) : null),
)

const assignments = useLiveQueryWithDeps(
  [() => props.instanceStepId],
  async (db, [id]) => {
    if (!id) return []
    return db.UserOnWorkflowInstanceStep.where('workflowInstanceStepId', id).exec()
  },
  { initial: [] },
)

const usersMap = useLiveQueryWithDeps(
  [() => assignments.value.map((a) => a.userId).join(',')],
  async (db, [userIdsStr]) => {
    if (!userIdsStr) return {}
    const userIds = [...new Set(userIdsStr.split(','))]
    const users = await Promise.all(userIds.map((id) => db.User.findByPk(id)))
    return Object.fromEntries(users.filter(Boolean).map((u) => [u.id, u]))
  },
  { initial: {} },
)

const records = useLiveQueryWithDeps(
  [() => props.instanceStepId, () => props.capaId],
  async (db, [stepInstanceId, capaId]) => {
    if (!stepInstanceId || !capaId) return []
    const all = await db.CapaRecord.where('workflowInstanceStepId', stepInstanceId).exec()
    return all.filter((r) => r.capaId === capaId)
  },
  { initial: [] },
)

const currentUserRecord = computed(
  () => records.value.find((r) => r.userId === currentUserId.value) || null,
)

const submittedRecords = computed(() => records.value.filter((r) => r.submittedAt))

const currentUserTask = useLiveQueryWithDeps(
  [() => props.instanceStepId, () => currentUserId.value],
  async (db, [stepInstanceId, userId]) => {
    if (!stepInstanceId || !userId) return null
    const tasks = await db.TaskInstance.where('[sourceType+sourceId]', [
      'WorkflowInstanceStep',
      stepInstanceId,
    ]).exec()
    return tasks.find((t) => t.assignedTo === userId) || null
  },
)

const isEditable = computed(() => currentUserTask.value?.statusId === 'ASSIGNED')

const formData = ref({})
const saving = ref(false)
let formSeeded = false

watch(
  [currentUserRecord, capa],
  ([record, capaRecord]) => {
    if (record && !formSeeded) {
      formData.value = {
        ...(record.payload || {}),
        _parent_problem: capaRecord?.description ?? '',
      }
      formSeeded = true
    }
  },
  { immediate: true },
)

watch(capa, (capaRecord) => {
  if (formSeeded) {
    formData.value._parent_problem = capaRecord?.description ?? ''
  }
})

async function persistRecord({ submit }) {
  if (saving.value) return
  if (!currentUserTask.value) {
    toast.error('No task assigned to you for this step')
    return
  }
  if (!instanceStep.value) return
  saving.value = true
  try {
    const { _parent_problem: _1, ...payload } = formData.value || {}
    const existing = currentUserRecord.value
    const submittedAt = submit ? DateTime.now() : (existing?.submittedAt ?? null)
    if (existing) {
      existing.payload = payload
      if (submit) existing.submittedAt = submittedAt
      await existing.save()
    } else {
      const record = db.CapaRecord.create({
        capaId: props.capaId,
        workflowInstanceStepId: props.instanceStepId,
        taskInstanceId: currentUserTask.value.id,
        stepId: instanceStep.value.stepId,
        payload,
        submittedAt,
      })
      await record.save()
    }
    toast.success(submit ? 'Form submitted' : 'Draft saved')
  } catch (e) {
    toast.error(e.message || 'Failed to save form')
  } finally {
    saving.value = false
  }
}

function saveDraft() {
  return persistRecord({ submit: false })
}

function submitForm() {
  return persistRecord({ submit: true })
}

function getUserName(userId) {
  const u = usersMap.value[userId]
  if (!u) return '—'
  return [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email
}

function getUserEmail(userId) {
  return usersMap.value[userId]?.email || '—'
}

function getStepStatusClass(statusId) {
  return {
    'tw:bg-blue-100 tw:text-blue-700': statusId === 'IN_PROGRESS',
    'tw:bg-gray-100 tw:text-gray-600': statusId === 'PENDING',
    'tw:bg-green-100 tw:text-green-700': statusId === 'APPROVED',
    'tw:bg-red-100 tw:text-red-700': statusId === 'CANCELLED',
    'tw:bg-orange-100 tw:text-orange-700': statusId === 'SENT_BACK',
  }
}

function getUserStatusClass(statusId) {
  return {
    'tw:bg-gray-100 tw:text-gray-600': statusId === 'PENDING',
    'tw:bg-blue-100 tw:text-blue-700': statusId === 'ASSIGNED',
    'tw:bg-green-100 tw:text-green-700': statusId === 'APPROVED',
    'tw:bg-red-100 tw:text-red-700': statusId === 'REJECTED',
    'tw:bg-orange-100 tw:text-orange-700': statusId === 'REASSIGNED',
    'tw:bg-yellow-100 tw:text-yellow-700': statusId === 'CANCELLED',
  }
}

function getStatusLabel(statusId) {
  if (!statusId) return '—'
  if (statusId === 'APPROVED') return 'Completed'
  return statusId.replace('_', ' ')
}

// CAPA nested stages: whether this step has children (drives form vs. sub-step list).
const childStepCount = useLiveQueryWithDeps(
  [() => stepDefinition.value?.id],
  async (db, [parentId]) => {
    if (!parentId) return 0
    const children = await db.WorkflowStep.where('parentStepId', parentId).exec()
    return children.length
  },
  { initial: 0 },
)

const hasChildren = computed(() => childStepCount.value > 0)
</script>

<template>
  <div v-if="instanceStep" class="tw:bg-white tw:border tw:border-divider tw:rounded-lg tw:p-5">
    <div
      class="tw:flex tw:flex-wrap tw:items-center tw:gap-2 tw:pb-3 tw:border-b tw:border-divider tw:mb-4"
    >
      <span class="tw:text-xs tw:font-semibold tw:text-secondary tw:uppercase tw:tracking-wider">
        {{ instanceStep.stepNumber }}. {{ stepDefinition?.name || 'Step' }}
      </span>
      <BaseBadge class="tw:text-[10px]" :class="getStepStatusClass(instanceStep.statusId)">
        {{ getStatusLabel(instanceStep.statusId) }}
      </BaseBadge>
    </div>

    <!-- Sub-tasks list (nested-parent stages only) -->
    <CapaWorkflowChildSteps
      v-if="hasChildren && stepDefinition?.id && instanceStep.workflowInstanceId"
      :parentStepId="stepDefinition.id"
      :workflowInstanceId="instanceStep.workflowInstanceId"
    />

    <!-- Assignees list (non-nested stages only) -->
    <div v-else class="tw:mb-4">
      <div class="tw:text-[11px] tw:text-secondary tw:font-medium tw:mb-2">Assignees</div>
      <div v-if="assignments.length" class="tw:flex tw:flex-col tw:gap-2">
        <div
          v-for="assignment in assignments"
          :key="assignment.id"
          class="tw:flex tw:items-center tw:gap-2"
        >
          <UserAvatarById :userId="assignment.userId" class="tw:size-8" />
          <div class="tw:flex tw:flex-col tw:gap-1 tw:min-w-0">
            <div>
              <span class="tw:text-xs tw:text-on-main tw:font-medium">
                {{ getUserName(assignment.userId) }}
              </span>
              <span
                class="tw:text-[9px] tw:px-1.5 tw:py-0.5 tw:rounded tw:font-medium tw:shrink-0 tw:ml-1"
                :class="getUserStatusClass(assignment.statusId)"
              >
                {{ getStatusLabel(assignment.statusId) }}
              </span>
            </div>
            <span class="tw:text-xs tw:text-secondary tw:truncate">
              {{ getUserEmail(assignment.userId) }}
            </span>
          </div>
        </div>
      </div>
      <span v-else class="tw:text-sm tw:text-secondary">—</span>
    </div>

    <template v-if="!hasChildren && stepDefinition?.formSchema?.length">
      <template v-if="isEditable">
        <DynamicForm v-model="formData" :fields="stepDefinition.formSchema" />
        <div class="tw:mt-4 tw:flex tw:justify-end tw:gap-2">
          <BaseButton variant="outline" :disabled="saving" @click="saveDraft">
            <template #icon><IconDeviceFloppy :size="16" /></template>
            {{ saving ? 'Saving…' : 'Save draft' }}
          </BaseButton>
          <BaseButton variant="primary" :disabled="saving" @click="submitForm">
            <template #icon><IconSend :size="16" /></template>
            Submit
          </BaseButton>
        </div>
      </template>

      <template v-else>
        <div class="tw:text-[11px] tw:text-secondary tw:font-medium tw:mb-2">Form data</div>
        <div v-for="record in submittedRecords" :key="record.id" class="tw:mb-3">
          <div
            v-if="submittedRecords.length > 1"
            class="tw:text-[11px] tw:text-secondary tw:font-medium tw:mb-2"
          >
            {{ getUserName(record.userId) }}
          </div>
          <FormSchemaReadonlyView
            :fields="stepDefinition.formSchema"
            :values="record.payload || {}"
          />
        </div>

        <div v-if="currentUserRecord && !currentUserRecord.submittedAt">
          <div class="tw:text-[11px] tw:text-amber-600 tw:font-medium tw:mb-2">
            Your draft (not submitted)
          </div>
          <FormSchemaReadonlyView
            :fields="stepDefinition.formSchema"
            :values="currentUserRecord.payload || {}"
          />
        </div>

        <DynamicForm
          v-if="!submittedRecords.length && !currentUserRecord"
          :fields="stepDefinition.formSchema"
          :readonly="true"
          disabled
          :values="{}"
        />
      </template>
    </template>
  </div>
</template>

<script setup>
import {
  IconUserCheck,
  IconArrowBackUp,
  IconDeviceFloppy,
  IconSend,
  IconCircleCheck,
} from '@tabler/icons-vue'
import DynamicForm from '@/components/form/DynamicForm.js'
import FormSchemaReadonlyView from '@/components/form/FormSchemaReadonlyView.vue'
import { currentSession } from '@/utils/currentSession.js'
import { db } from '@models/index'
import { post } from '@/api'
import { DateTime } from 'luxon'

const props = defineProps({
  instanceStepId: { type: String, required: true },
  capaId: { type: String, required: true },
  isOwner: { type: Boolean, default: false },
  hasSendBackTargets: { type: Boolean, default: false },
})

const emit = defineEmits(['reassign', 'sendBack'])

const toast = useToast()
const currentUserId = computed(() => currentSession.value?.userId)

const capa = useLiveQueryWithDeps(
  [() => props.capaId],
  async (db, [id]) => (id ? db.Capa.findByPk(id) : null),
)

const instanceStep = useLiveQueryWithDeps(
  [() => props.instanceStepId],
  async (db, [id]) => (id ? db.WorkflowInstanceStep.findByPk(id) : null),
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

const canReassign = computed(() => {
  const status = instanceStep.value?.statusId
  return (
    props.isOwner && (status === 'PENDING' || status === 'IN_PROGRESS' || status === 'SENT_BACK')
  )
})

const canSendBack = computed(
  () => props.isOwner && instanceStep.value?.statusId === 'IN_PROGRESS' && props.hasSendBackTargets,
)

// ─── Child sub-steps (CAPA nested stages) ─────────────────────────────────────
const childStepDefs = useLiveQueryWithDeps(
  [() => stepDefinition.value?.id],
  async (db, [parentId]) => {
    if (!parentId) return []
    return db.WorkflowStep.where('parentStepId', parentId).orderBy('stepOrder').exec()
  },
  { initial: [] },
)

const hasChildren = computed(() => childStepDefs.value.length > 0)

// Latest instance step per child stepId in the same workflow instance.
const childInstanceSteps = useLiveQueryWithDeps(
  [
    () => instanceStep.value?.workflowInstanceId,
    () => childStepDefs.value.map((s) => s.id).join(','),
  ],
  async (db, [workflowInstanceId, idsStr]) => {
    if (!workflowInstanceId || !idsStr) return []
    const childStepIds = new Set(idsStr.split(','))
    const all = await db.WorkflowInstanceStep.where(
      'workflowInstanceId',
      workflowInstanceId,
    ).exec()
    const latest = new Map()
    for (const s of all) {
      if (!childStepIds.has(s.stepId)) continue
      const existing = latest.get(s.stepId)
      if (!existing || s.createdAt > existing.createdAt) latest.set(s.stepId, s)
    }
    return [...latest.values()].sort((a, b) => a.stepNumber - b.stepNumber)
  },
  { initial: [] },
)

const allChildrenApproved = computed(
  () =>
    hasChildren.value &&
    childInstanceSteps.value.length > 0 &&
    childInstanceSteps.value.every((s) => s.statusId === 'APPROVED'),
)

// Task instances + assignees for each child instance step (used by the table).
const childTaskInstances = useLiveQueryWithDeps(
  [() => childInstanceSteps.value.map((s) => s.id).join(',')],
  async (db, [idsStr]) => {
    if (!idsStr) return []
    const ids = idsStr.split(',')
    const fetched = await Promise.all(
      ids.map((id) =>
        db.TaskInstance.where('[sourceType+sourceId]', ['WorkflowInstanceStep', id]).exec(),
      ),
    )
    return fetched.flat()
  },
  { initial: [] },
)

function activeTaskFor(childInstanceStepId) {
  // The active assignee task for a child stage is the most-recent non-terminal
  // TaskInstance on that step.
  const tasks = childTaskInstances.value.filter((t) => t.sourceId === childInstanceStepId)
  if (!tasks.length) return null
  const active = tasks.find((t) => ['ASSIGNED', 'IN_PROGRESS'].includes(t.statusId))
  if (active) return active
  return tasks.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0))[0]
}

function childTitle(childInstanceStep) {
  return childStepDefs.value.find((d) => d.id === childInstanceStep.stepId)?.name || 'Step'
}

function childDueDate(childInstanceStep) {
  const def = childStepDefs.value.find((d) => d.id === childInstanceStep.stepId)
  if (!def?.slaDays || !childInstanceStep.startedAt) return null
  return childInstanceStep.startedAt.plus({ days: def.slaDays })
}

// ─── Approve & Advance ────────────────────────────────────────────────────────
const approveAdvancing = ref(false)

const canApproveAdvance = computed(() => {
  if (!currentUserTask.value || currentUserTask.value.statusId !== 'ASSIGNED') return false
  if (hasChildren.value && !allChildrenApproved.value) return false
  return true
})

async function approveAndAdvance() {
  if (!currentUserTask.value) return
  approveAdvancing.value = true
  try {
    await post(`/v1/services/taskInstances/${currentUserTask.value.id}/action`, {
      action: 'APPROVE',
    })
    toast.success('Stage approved')
  } catch (e) {
    toast.error(e.message || 'Failed to approve')
  } finally {
    approveAdvancing.value = false
  }
}
</script>

<template>
  <div
    v-if="instanceStep"
    class="tw:bg-white tw:border tw:border-divider tw:rounded-lg tw:p-5"
  >
    <div
      class="tw:flex tw:flex-wrap tw:items-center tw:justify-between tw:gap-2 tw:pb-3 tw:border-b tw:border-divider tw:mb-4"
    >
      <div class="tw:flex tw:items-center tw:gap-2 tw:min-w-0">
        <span
          class="tw:text-xs tw:font-semibold tw:text-secondary tw:uppercase tw:tracking-wider"
        >
          {{ instanceStep.stepNumber }}. {{ stepDefinition?.name || 'Step' }}
        </span>
        <BaseBadge class="tw:text-[10px]" :class="getStepStatusClass(instanceStep.statusId)">
          {{ getStatusLabel(instanceStep.statusId) }}
        </BaseBadge>
      </div>
      <div class="tw:flex tw:items-center tw:gap-2">
        <button
          v-if="canSendBack"
          class="tw:flex tw:items-center tw:gap-1 tw:text-xs tw:text-amber-600 tw:hover:text-amber-700 tw:cursor-pointer tw:font-medium"
          @click="emit('sendBack')"
        >
          <IconArrowBackUp :size="14" />
          Send back
        </button>
        <button
          v-if="canReassign"
          class="tw:flex tw:items-center tw:gap-1 tw:text-xs tw:text-primary tw:hover:underline tw:cursor-pointer tw:font-medium"
          @click="emit('reassign', instanceStepId)"
        >
          <IconUserCheck :size="14" />
          Reassign
        </button>
        <BaseButton
          v-if="currentUserTask?.statusId === 'ASSIGNED'"
          variant="primary"
          size="sm"
          :disabled="!canApproveAdvance || approveAdvancing"
          :title="
            hasChildren && !allChildrenApproved
              ? 'All sub-tasks must be approved before advancing'
              : ''
          "
          @click="approveAndAdvance"
        >
          <template #icon><IconCircleCheck :size="14" /></template>
          {{ approveAdvancing ? 'Approving…' : 'Approve & Advance' }}
        </BaseButton>
      </div>
    </div>

    <!-- Sub-tasks table (nested-parent stages only) -->
    <div v-if="hasChildren" class="tw:overflow-x-auto">
      <table class="tw:w-full tw:text-sm">
        <thead class="tw:bg-main-hover">
          <tr>
            <th
              class="tw:text-left tw:px-3 tw:py-2 tw:text-[11px] tw:font-semibold tw:text-secondary tw:uppercase"
            >
              Task
            </th>
            <th
              class="tw:text-left tw:px-3 tw:py-2 tw:text-[11px] tw:font-semibold tw:text-secondary tw:uppercase"
            >
              Assignee
            </th>
            <th
              class="tw:text-left tw:px-3 tw:py-2 tw:text-[11px] tw:font-semibold tw:text-secondary tw:uppercase"
            >
              Due date
            </th>
            <th
              class="tw:text-left tw:px-3 tw:py-2 tw:text-[11px] tw:font-semibold tw:text-secondary tw:uppercase"
            >
              Status
            </th>
            <th
              class="tw:text-right tw:px-3 tw:py-2 tw:text-[11px] tw:font-semibold tw:text-secondary tw:uppercase"
            ></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="child in childInstanceSteps"
            :key="child.id"
            class="tw:border-t tw:border-divider"
          >
            <td class="tw:px-3 tw:py-2 tw:text-on-main tw:font-medium">
              {{ childTitle(child) }}
            </td>
            <td class="tw:px-3 tw:py-2">
              <UserBadgeById
                v-if="activeTaskFor(child.id)?.assignedTo"
                :userId="activeTaskFor(child.id).assignedTo"
              />
              <span v-else class="tw:text-secondary">—</span>
            </td>
            <td class="tw:px-3 tw:py-2 tw:text-secondary">
              {{ childDueDate(child)?.formatDate('date') || '—' }}
            </td>
            <td class="tw:px-3 tw:py-2">
              <BaseBadge :class="getStepStatusClass(child.statusId)">
                {{ getStatusLabel(child.statusId) }}
              </BaseBadge>
            </td>
            <td class="tw:px-3 tw:py-2 tw:text-right">
              <button
                v-if="
                  isOwner &&
                  ['PENDING', 'IN_PROGRESS', 'SENT_BACK'].includes(child.statusId)
                "
                class="tw:flex tw:items-center tw:gap-1 tw:text-xs tw:text-primary tw:hover:underline tw:cursor-pointer tw:font-medium tw:ml-auto"
                @click="emit('reassign', child.id)"
              >
                <IconUserCheck :size="14" />
                Reassign
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

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

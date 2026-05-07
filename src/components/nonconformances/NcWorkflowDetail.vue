<script setup>
import { IconUserCheck, IconArrowBackUp, IconDeviceFloppy, IconSend } from '@tabler/icons-vue'
import { post } from '@/api'
import DynamicForm from '@/components/form/DynamicForm.js'
import FormSchemaReadonlyView from '@/components/form/FormSchemaReadonlyView.vue'
import { currentSession } from '@/utils/currentSession.js'
import { db } from '@models/index'
import { DateTime } from 'luxon'

const props = defineProps({
  ncId: { type: String, required: true },
  workflowInstanceId: { type: String, default: null },
  isOwner: { type: Boolean, default: false },
})

const toast = useToast()
const currentUserId = computed(() => currentSession.value?.userId)

// ─── Workflow instance steps ──────────────────────────────────────────────────
const workflowInstanceSteps = useLiveQueryWithDeps(
  [() => props.workflowInstanceId],
  async (db, [instanceId]) => {
    if (!instanceId) return []
    const all = await db.WorkflowInstanceStep.where('workflowInstanceId', instanceId)
      .orderBy('stepNumber', 'asc')
      .exec()
    // After a send-back the same stepId can have multiple instances.
    // Keep only the most recently created one per stepId, then re-sort by stepNumber.
    const latestByStepId = new Map()
    for (const step of all) {
      const existing = latestByStepId.get(step.stepId)
      if (!existing || step.createdAt > existing.createdAt) {
        latestByStepId.set(step.stepId, step)
      }
    }
    return [...latestByStepId.values()].sort((a, b) => a.stepNumber - b.stepNumber)
  },
  { initial: [] },
)

// ─── Step definitions ─────────────────────────────────────────────────────────
const stepDefinitions = useLiveQueryWithDeps(
  [() => workflowInstanceSteps.value.map((s) => s.stepId).join(',')],
  async (db, [stepIdsStr]) => {
    if (!stepIdsStr) return {}
    const stepIds = stepIdsStr.split(',')
    const steps = await Promise.all(stepIds.map((id) => db.WorkflowStep.findByPk(id)))
    const map = {}
    for (const s of steps) {
      if (s) map[s.id] = s
    }
    return map
  },
  { initial: {} },
)

// ─── Step assignments (all users per step) ────────────────────────────────────
const stepAssignments = useLiveQueryWithDeps(
  [() => workflowInstanceSteps.value.map((s) => s.id).join(',')],
  async (db, [stepIdsStr]) => {
    if (!stepIdsStr) return {}
    const stepIds = stepIdsStr.split(',')
    const map = {}
    for (const stepId of stepIds) {
      map[stepId] = await db.UserOnWorkflowInstanceStep.where(
        'workflowInstanceStepId',
        stepId,
      ).exec()
    }
    return map
  },
  { initial: {} },
)

// ─── User lookup for displaying names ─────────────────────────────────────────
const assignedUsers = useLiveQueryWithDeps(
  [
    () =>
      Object.values(stepAssignments.value)
        .flat()
        .map((a) => a.userId)
        .join(','),
  ],
  async (db, [userIdsStr]) => {
    if (!userIdsStr) return {}
    const userIds = [...new Set(userIdsStr.split(','))]
    const users = await Promise.all(userIds.map((id) => db.User.findByPk(id)))
    const map = {}
    for (const u of users) {
      if (u) map[u.id] = u
    }
    return map
  },
  { initial: {} },
)

function getUserName(userId) {
  const u = assignedUsers.value[userId]
  if (!u) return '—'
  return [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email
}

function getUserEmail(userId) {
  const u = assignedUsers.value[userId]
  return u ? u.email : '—'
}

// ─── NC records per step ──────────────────────────────────────────────────────
const ncRecords = useLiveQueryWithDeps(
  [() => props.ncId],
  async (db, [ncId]) => {
    if (!ncId) return {}
    const records = await db.NcRecord.where('ncId', ncId).exec()
    const map = {}
    for (const r of records) {
      if (!map[r.workflowInstanceStepId]) map[r.workflowInstanceStepId] = []
      map[r.workflowInstanceStepId].push(r)
    }
    return map
  },
  { initial: {}, models: 'NcRecord' },
)

// ─── Current IN_PROGRESS step ─────────────────────────────────────────────────
const currentStep = computed(() =>
  workflowInstanceSteps.value.find((s) => s.statusId === 'IN_PROGRESS'),
)

// ─── Send-back targets for current step ───────────────────────────────────────
const sendBackTargets = useLiveQueryWithDeps(
  [() => currentStep.value?.stepId],
  async (db, [stepId]) => {
    if (!stepId) return []
    return db.StepSendBackTarget.where('stepId', stepId).exec()
  },
  { initial: [] },
)

// ─── Current user's tasks for this workflow's steps ───────────────────────────
// Used to satisfy NcRecord.taskInstanceId when the assignee saves/submits.
const currentUserTasksByStep = useLiveQueryWithDeps(
  [() => workflowInstanceSteps.value.map((s) => s.id).join(','), () => currentUserId.value],
  async (db, [stepIdsStr, userId]) => {
    if (!stepIdsStr || !userId) return {}
    const stepIds = stepIdsStr.split(',')
    const map = {}
    for (const stepId of stepIds) {
      const tasks = await db.TaskInstance.where('[sourceType+sourceId]', [
        'WorkflowInstanceStep',
        stepId,
      ]).exec()
      const ownTask = tasks.find((t) => t.assignedTo === userId)
      if (ownTask) map[stepId] = ownTask
    }
    return map
  },
  { initial: {}, models: 'TaskInstance' },
)

// ─── Per-step form state for the current user ────────────────────────────────
const formDataByStep = ref({})
const savingByStep = ref({})

function getCurrentUserAssignment(instanceStepId) {
  const list = stepAssignments.value[instanceStepId] || []
  return list.find((a) => a.userId === currentUserId.value) || null
}

function getCurrentUserRecord(instanceStepId) {
  const records = ncRecords.value[instanceStepId] || []
  return records.find((r) => r.userId === currentUserId.value) || null
}

function isStepEditableByCurrentUser(step) {
  if (step.statusId !== 'IN_PROGRESS') return false
  if (!getCurrentUserAssignment(step.id)) return false
  const record = getCurrentUserRecord(step.id)
  return !record || !record.submittedAt
}

// Seed formDataByStep from the current user's NcRecord whenever it changes.
watch(
  ncRecords,
  () => {
    for (const step of workflowInstanceSteps.value) {
      const record = getCurrentUserRecord(step.id)
      if (record && !(step.id in formDataByStep.value)) {
        formDataByStep.value[step.id] = { ...(record.payload || {}) }
      }
    }
  },
  { immediate: true, deep: true },
)

async function persistRecord(step, { submit }) {
  if (savingByStep.value[step.id]) return
  const taskInstance = currentUserTasksByStep.value[step.id]
  if (!taskInstance) {
    toast.error('No task assigned to you for this step')
    return
  }
  savingByStep.value[step.id] = true
  try {
    const payload = { ...(formDataByStep.value[step.id] || {}) }
    const existing = getCurrentUserRecord(step.id)
    const submittedAt = submit ? DateTime.now() : (existing?.submittedAt ?? null)
    if (existing) {
      existing.payload = payload
      if (submit) existing.submittedAt = submittedAt
      await existing.save()
    } else {
      const record = db.NcRecord.create({
        ncId: props.ncId,
        workflowInstanceStepId: step.id,
        taskInstanceId: taskInstance.id,
        stepId: step.stepId,
        payload,
        submittedAt,
      })
      await record.save()
    }
    toast.success(submit ? 'Form submitted' : 'Draft saved')
  } catch (e) {
    toast.error(e.message || 'Failed to save form')
  } finally {
    savingByStep.value[step.id] = false
  }
}

function saveDraft(step) {
  return persistRecord(step, { submit: false })
}

function submitForm(step) {
  return persistRecord(step, { submit: true })
}

// ─── Reassign dialog ──────────────────────────────────────────────────────────
const showReassignDialog = ref(false)
const reassignStepId = ref(null)
const reassignToUserId = ref(null)
const reassigning = ref(false)

const reassignStepDefinition = computed(() => {
  if (!reassignStepId.value) return null
  const instanceStep = workflowInstanceSteps.value.find((s) => s.id === reassignStepId.value)
  return instanceStep ? stepDefinitions.value[instanceStep.stepId] : null
})

const reassignStepRoles = useLiveQueryWithDeps(
  [() => reassignStepDefinition.value?.id],
  async (db, [stepId]) => {
    if (!stepId) return []
    return db.WorkflowStepRole.where('stepId', stepId).exec()
  },
  { initial: [] },
)

const reassignCandidates = useLiveQueryWithDeps(
  [() => reassignStepRoles.value.map((r) => r.roleId).join(',')],
  async (db, [roleIdsStr]) => {
    if (!roleIdsStr) return []
    const roleIds = roleIdsStr.split(',')
    const rolesOnUsers = await Promise.all(
      roleIds.map((id) => db.RoleOnUser.where('roleId', id).exec()),
    )
    const userIds = [...new Set(rolesOnUsers.flat().map((r) => r.userId))]
    const users = await Promise.all(userIds.map((id) => db.User.findByPk(id)))
    return users.filter(Boolean)
  },
  { initial: [] },
)

const filteredReassignCandidates = computed(() => {
  const currentAssignments = stepAssignments.value[reassignStepId.value] || []
  const assignedUserIds = currentAssignments.map((a) => a.userId)
  return reassignCandidates.value.filter((u) => !assignedUserIds.includes(u.id))
})

function openReassignDialog(stepId) {
  reassignStepId.value = stepId
  reassignToUserId.value = null
  showReassignDialog.value = true
}

async function handleReassign() {
  if (!reassignStepId.value || !reassignToUserId.value) return
  reassigning.value = true
  try {
    await post(`/v1/services/nonconformances/${props.ncId}/reassignStepReviewer`, {
      workflowInstanceStepId: reassignStepId.value,
      toUserId: reassignToUserId.value,
    })
    showReassignDialog.value = false
    toast.success('Reviewer reassigned successfully')
  } catch (e) {
    toast.error(e.message || 'Failed to reassign reviewer')
  } finally {
    reassigning.value = false
  }
}

// ─── Send back dialog ─────────────────────────────────────────────────────────
const showSendBackDialog = ref(false)
const sendBackTargetStepId = ref(null)
const sendingBack = ref(false)

function openSendBackDialog() {
  sendBackTargetStepId.value = null
  showSendBackDialog.value = true
}

async function handleSendBack() {
  if (!sendBackTargetStepId.value) return
  sendingBack.value = true
  try {
    await post(`/v1/services/nonconformances/${props.ncId}/sendBack`, {
      targetStepId: sendBackTargetStepId.value,
    })
    showSendBackDialog.value = false
    toast.success('Step sent back successfully')
  } catch (e) {
    toast.error(e.message || 'Failed to send back step')
  } finally {
    sendingBack.value = false
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
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
  if (statusId === 'APPROVED') return 'Completed'
  return statusId.replace('_', ' ')
}

function canReassignStep(step) {
  return (
    props.isOwner &&
    (step.statusId === 'PENDING' ||
      step.statusId === 'IN_PROGRESS' ||
      step.statusId === 'SENT_BACK')
  )
}

function getStepRecords(instanceStepId) {
  return ncRecords.value[instanceStepId] || []
}

function getSubmittedRecords(instanceStepId) {
  return getStepRecords(instanceStepId).filter((r) => r.submittedAt)
}
</script>

<template>
  <template v-if="workflowInstanceSteps.length">
    <div
      v-for="step in workflowInstanceSteps"
      :key="step.id"
      class="tw:bg-white tw:border tw:border-divider tw:rounded-lg tw:p-5"
    >
      <!-- Step header -->
      <div
        class="tw:flex tw:items-center tw:justify-between tw:pb-3 tw:border-b tw:border-divider tw:mb-4"
      >
        <div class="tw:flex tw:items-center tw:gap-2">
          <span
            class="tw:text-xs tw:font-semibold tw:text-secondary tw:uppercase tw:tracking-wider"
          >
            {{ step.stepNumber }}. {{ stepDefinitions[step.stepId]?.name || 'Step' }}
          </span>
          <BaseBadge class="tw:text-[10px]" :class="getStepStatusClass(step.statusId)">
            {{ getStatusLabel(step.statusId) }}
          </BaseBadge>
        </div>
        <div class="tw:flex tw:items-center tw:gap-2">
          <button
            v-if="isOwner && step.statusId === 'IN_PROGRESS' && sendBackTargets.length"
            class="tw:flex tw:items-center tw:gap-1 tw:text-xs tw:text-amber-600 tw:hover:text-amber-700 tw:cursor-pointer tw:font-medium"
            @click="openSendBackDialog"
          >
            <IconArrowBackUp :size="14" />
            Send back
          </button>
          <button
            v-if="canReassignStep(step)"
            class="tw:flex tw:items-center tw:gap-1 tw:text-xs tw:text-primary tw:hover:underline tw:cursor-pointer tw:font-medium"
            @click="openReassignDialog(step.id)"
          >
            <IconUserCheck :size="14" />
            Reassign
          </button>
        </div>
      </div>

      <!-- Assignees -->
      <div class="tw:mb-4">
        <div class="tw:text-[11px] tw:text-secondary tw:font-medium tw:mb-2">Assignees</div>
        <div
          v-if="stepAssignments[step.id]?.length"
          class="tw:flex tw:flex-col tw:flex-wrap tw:gap-2"
        >
          <div
            v-for="assignment in stepAssignments[step.id]"
            :key="assignment.id"
            class="tw:flex tw:items-center tw:gap-2"
          >
            <UserAvatarById :userId="assignment.userId" class="tw:size-8" />
            <div class="tw:flex tw:flex-col tw:gap-1">
              <div>
                <span class="tw:text-xs tw:text-on-main tw:font-medium">
                  {{ getUserName(assignment.userId) }}
                </span>
                <span
                  class="tw:text-[9px] tw:px-1.5 tw:py-0.5 tw:rounded tw:font-medium tw:shrink-0"
                  :class="getUserStatusClass(assignment.statusId)"
                >
                  {{ getStatusLabel(assignment.statusId) }}
                </span>
              </div>
              <span class="tw:text-xs tw:text-secondary">{{
                getUserEmail(assignment.userId)
              }}</span>
            </div>
          </div>
        </div>
        <span v-else class="tw:text-sm tw:text-secondary">—</span>
      </div>

      <!-- Step form (editable for the assignee while step is in progress; readonly otherwise) -->
      <template v-if="stepDefinitions[step.stepId]?.formSchema?.length">
        <!-- Editable: current user is assignee on an in-progress step and has not submitted yet. -->
        <template v-if="isStepEditableByCurrentUser(step)">
          <DynamicForm
            v-model="formDataByStep[step.id]"
            :fields="stepDefinitions[step.stepId].formSchema"
          />
          <div class="tw:mt-4 tw:flex tw:justify-end tw:gap-2">
            <BaseButton
              variant="outline"
              :disabled="savingByStep[step.id]"
              @click="saveDraft(step)"
            >
              <template #icon><IconDeviceFloppy :size="16" /></template>
              {{ savingByStep[step.id] ? 'Saving…' : 'Save draft' }}
            </BaseButton>
            <BaseButton
              variant="primary"
              :disabled="savingByStep[step.id]"
              @click="submitForm(step)"
            >
              <template #icon><IconSend :size="16" /></template>
              Submit
            </BaseButton>
          </div>
        </template>

        <!-- Readonly: render every submitted record, plus the current user's draft (only). -->
        <template v-else>
          <!-- label -->
          <div class="tw:text-[11px] tw:text-secondary tw:font-medium tw:mb-2">Form data</div>
          <div v-for="record in getSubmittedRecords(step.id)" :key="record.id" class="tw:mb-3">
            <div
              v-if="getSubmittedRecords(step.id).length > 1"
              class="tw:text-[11px] tw:text-secondary tw:font-medium tw:mb-2"
            >
              {{ getUserName(record.userId) }}
            </div>
            <FormSchemaReadonlyView
              :fields="stepDefinitions[step.stepId].formSchema"
              :values="record.payload || {}"
            />
          </div>

          <div v-if="getCurrentUserRecord(step.id) && !getCurrentUserRecord(step.id).submittedAt">
            <div class="tw:text-[11px] tw:text-amber-600 tw:font-medium tw:mb-2">
              Your draft (not submitted)
            </div>
            <FormSchemaReadonlyView
              :fields="stepDefinitions[step.stepId].formSchema"
              :values="getCurrentUserRecord(step.id).payload || {}"
            />
          </div>

          <DynamicForm
            v-if="!getSubmittedRecords(step.id).length && !getCurrentUserRecord(step.id)"
            :fields="stepDefinitions[step.stepId].formSchema"
            :readonly="true"
            disabled
            :values="{}"
          />
        </template>
      </template>
    </div>
  </template>

  <!-- Reassign dialog -->
  <BaseDialog v-model="showReassignDialog" title="Reassign Step Reviewer" maxWidth="md">
    <div class="tw:mb-4">
      <label class="tw:block tw:text-sm tw:font-medium tw:text-on-main tw:mb-2">
        Select new reviewer <span class="tw:text-red-500">*</span>
      </label>
      <div class="tw:flex tw:flex-col tw:gap-2">
        <label
          v-for="user in filteredReassignCandidates"
          :key="user.id"
          class="tw:flex tw:items-center tw:gap-3 tw:cursor-pointer tw:rounded-lg tw:px-3 tw:py-2 tw:border tw:transition-colors"
          :class="
            reassignToUserId === user.id
              ? 'tw:border-primary tw:bg-primary/5'
              : 'tw:border-divider tw:hover:bg-main-hover'
          "
        >
          <input
            v-model="reassignToUserId"
            type="radio"
            :value="user.id"
            class="tw:accent-primary"
          />
          <div class="tw:flex-1 tw:min-w-0">
            <div class="tw:text-sm tw:font-medium tw:text-on-main">
              {{ [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email }}
            </div>
            <div class="tw:text-xs tw:text-secondary tw:truncate">{{ user.email }}</div>
          </div>
        </label>
        <p v-if="!filteredReassignCandidates.length" class="tw:text-sm tw:text-secondary">
          No eligible users available for reassignment.
        </p>
      </div>
    </div>
    <div class="tw:flex tw:justify-end tw:gap-2 tw:pt-3 tw:border-t tw:border-divider">
      <BaseButton variant="outline" @click="showReassignDialog = false">Cancel</BaseButton>
      <BaseButton
        variant="primary"
        :disabled="!reassignToUserId || reassigning"
        @click="handleReassign"
      >
        {{ reassigning ? 'Reassigning…' : 'Reassign' }}
      </BaseButton>
    </div>
  </BaseDialog>

  <!-- Send back dialog -->
  <BaseDialog v-model="showSendBackDialog" title="Send Back Step" maxWidth="md">
    <div class="tw:mb-4">
      <label class="tw:block tw:text-sm tw:font-medium tw:text-on-main tw:mb-2">
        Select target step to send back to <span class="tw:text-red-500">*</span>
      </label>
      <div class="tw:flex tw:flex-col tw:gap-2">
        <label
          v-for="target in sendBackTargets"
          :key="target.id"
          class="tw:flex tw:items-center tw:gap-3 tw:cursor-pointer tw:rounded-lg tw:px-3 tw:py-2 tw:border tw:transition-colors"
          :class="
            sendBackTargetStepId === target.targetStepId
              ? 'tw:border-primary tw:bg-primary/5'
              : 'tw:border-divider tw:hover:bg-main-hover'
          "
        >
          <input
            v-model="sendBackTargetStepId"
            type="radio"
            :value="target.targetStepId"
            class="tw:accent-primary"
          />
          <span class="tw:text-sm tw:font-medium tw:text-on-main">
            {{ stepDefinitions[target.targetStepId]?.name || target.targetStepId }}
          </span>
        </label>
        <p v-if="!sendBackTargets.length" class="tw:text-sm tw:text-secondary">
          No send-back targets configured for this step.
        </p>
      </div>
    </div>
    <div class="tw:flex tw:justify-end tw:gap-2 tw:pt-3 tw:border-t tw:border-divider">
      <BaseButton variant="outline" @click="showSendBackDialog = false">Cancel</BaseButton>
      <BaseButton
        variant="primary"
        :disabled="!sendBackTargetStepId || sendingBack"
        @click="handleSendBack"
      >
        {{ sendingBack ? 'Sending…' : 'Send back' }}
      </BaseButton>
    </div>
  </BaseDialog>
</template>

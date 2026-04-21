<script setup>
import { IconCircleCheck, IconX, IconEdit } from '@tabler/icons-vue'
import { post } from '@/api'

const props = defineProps({
  action: {
    type: String,
    required: true,
    validator: (value) => ['APPROVE', 'REJECT', 'REQUEST_CHANGES'].includes(value),
  },
  workflowInstanceId: { type: String, required: true },
  instanceStepId: { type: String, default: null },
})

const emit = defineEmits(['done'])

const toast = useToast()

// ── SyncEngine queries for step data ───────────────────────────────────────────
const instanceStep = useLiveQueryWithDeps([() => props.instanceStepId], async (db, [stepId]) => {
  if (!stepId) return null
  return db.WorkflowInstanceStep.findByPk(stepId)
})

const workflowStep = useLiveQueryWithDeps(
  [() => instanceStep.value?.stepId],
  async (db, [stepId]) => {
    if (!stepId) return null
    return db.WorkflowTemplateStage.findByPk(stepId)
  },
)

// ── Inline workflow action (server-side command — NOT SyncEngine) ──────────────
const actionLoading = ref(false)

async function updateWorkflowStep(instanceId, action, payload = {}) {
  actionLoading.value = true
  try {
    const data = await post(`/v1/services/workflowInstances/${instanceId}/${action}`, payload)
    return { workflowInstance: data.workflowInstance }
  } finally {
    actionLoading.value = false
  }
}

// ── State ──────────────────────────────────────────────────────────────────────
const showFeedbackDialog = ref(false)
const showEsignDialog = ref(false)
const feedbackAction = ref('') // 'REJECT' or 'REQUEST_CHANGES'
const pendingAction = ref(null) // stores the action key to execute after e-sign
const comment = ref('')

const requireEsignature = computed(() => workflowStep.value?.requireEsignature)

const dialogTitle = computed(() => {
  return feedbackAction.value === 'REJECT' ? 'Reject Step' : 'Request Changes'
})

const dialogMessage = computed(() => {
  return feedbackAction.value === 'REJECT'
    ? 'Are you sure you want to reject this document? Your section comments will be shared with the document owner.'
    : 'Are you sure you want to request changes? Your section comments will be shared with the document owner.'
})

// ── OAuth redirect callback handling ───────────────────────────────────────────
onMounted(() => {
  const url = new URL(window.location.href)
  const esignCompleted = url.searchParams.get('esignCompleted')
  const esignError = url.searchParams.get('esignError')

  if (!esignCompleted && !esignError) return

  // Clean up query params from URL
  url.searchParams.delete('esignCompleted')
  url.searchParams.delete('esignError')
  window.history.replaceState({}, '', url.pathname + url.search)

  if (esignError) {
    const errorMessages = {
      email_mismatch: 'The OAuth account does not match your signed-in account.',
      oauth_cancelled: 'OAuth verification was cancelled.',
      verification_failed: 'Identity verification failed.',
      verification_timeout: 'Verification timed out. Please try again.',
      invalid_state: 'Invalid verification state. Please try again.',
      user_not_found: 'User not found.',
      action_failed: 'Workflow action failed. Please try again.',
      no_verification_pending: 'No verification was pending.',
    }
    toast.error(errorMessages[esignError] || 'E-sign verification failed.')
    return
  }

  if (esignCompleted) {
    const actionLabels = {
      APPROVE: 'approved',
      REJECT: 'rejected',
      REQUEST_CHANGES: 'changes requested',
    }
    toast.success(`Step ${actionLabels[esignCompleted] || 'action completed'} successfully`)
    emit('done')
  }
})

// ── Actions ────────────────────────────────────────────────────────────────────
async function triggerEsignOrExecute(actionKey) {
  if (requireEsignature.value) {
    pendingAction.value = actionKey

    // Store context in server session (Redis) so the OAuth callback can execute the action
    await post('/v1/services/verify-identity/esign-context', {
      action: props.action,
      actionKey,
      feedbackAction: feedbackAction.value,
      workflowInstanceId: props.workflowInstanceId,
      comment: feedbackAction.value === 'REJECT' ? comment.value : undefined,
    })

    showEsignDialog.value = true
  } else {
    executeAction(actionKey, {})
  }
}

function onEsignVerified(esign) {
  if (pendingAction.value) {
    executeAction(pendingAction.value, esign)
  }
}

async function executeAction(actionKey, esign) {
  if (actionKey === 'approve') {
    await submitApprove(esign)
  } else if (actionKey === 'feedback') {
    await submitFeedback(esign)
  }
}

async function submitApprove(esign) {
  try {
    const payload = {}
    if (esign?.strategy) payload.esign = esign

    await updateWorkflowStep(props.workflowInstanceId, 'approve', payload)

    toast.success('Step approved successfully')
    showEsignDialog.value = false
    pendingAction.value = null
    emit('done')
  } catch {
    // If e-sign failed, keep the dialog open so user doesn't lose their input
  }
}

async function submitFeedback(esign) {
  try {
    const action = feedbackAction.value === 'REJECT' ? 'reject' : 'requestChanges'
    const actionLabel = feedbackAction.value === 'REJECT' ? 'rejected' : 'changes requested'

    const payload = {}
    if (esign?.strategy) payload.esign = esign
    if (feedbackAction.value === 'REJECT' && comment.value) payload.comment = comment.value

    const result = await updateWorkflowStep(props.workflowInstanceId, action, payload)

    if (result.error) {
      toast.error(result.error || `Failed to ${action} step`)
      return
    }

    toast.success(`Step ${actionLabel} successfully`)
    showFeedbackDialog.value = false
    pendingAction.value = null
    comment.value = ''
    emit('done')
  } catch {
    // If e-sign failed, keep the feedback dialog open so user doesn't lose their input
  }
}

function onApprove() {
  triggerEsignOrExecute('approve')
}

function onReject() {
  feedbackAction.value = 'REJECT'
  comment.value = ''
  showFeedbackDialog.value = true
}

function onRequestChanges() {
  feedbackAction.value = 'REQUEST_CHANGES'
  showFeedbackDialog.value = true
}

function onConfirmFeedback() {
  triggerEsignOrExecute('feedback')
}
</script>

<template>
  <div class="tw:text-center">
    <BaseButton
      v-if="action === 'APPROVE'"
      :isLoading="actionLoading"
      class="tw:font-bold tw:shadow-md tw:shadow-primary/20!"
      @click="onApprove"
    >
      <template #icon>
        <IconCircleCheck :size="18" />
      </template>
      Approve
    </BaseButton>

    <BaseButton
      v-if="action === 'REJECT'"
      variant="outline"
      class="tw:text-red-600! tw:border-red-200! tw:hover:bg-red-50! tw:font-bold"
      :isLoading="actionLoading"
      @click="onReject"
    >
      <template #icon>
        <IconX :size="18" />
      </template>
      Reject
    </BaseButton>

    <BaseButton
      v-if="action === 'REQUEST_CHANGES'"
      variant="outline"
      class="tw:text-secondary tw:border-divider tw:hover:bg-main tw:font-bold"
      :isLoading="actionLoading"
      @click="onRequestChanges"
    >
      <template #icon>
        <IconEdit :size="18" />
      </template>
      Request Changes
    </BaseButton>

    <!-- Feedback Dialog (Reject / Request Changes) -->
    <BaseDialog v-model="showFeedbackDialog" :title="dialogTitle" maxWidth="md" persistent>
      <p class="tw:text-sm tw:text-secondary">
        {{ dialogMessage }}
      </p>

      <BaseTextarea
        v-if="feedbackAction === 'REJECT'"
        v-model="comment"
        label="Comment (optional)"
        :rows="3"
        autosize
        class="tw:mt-4"
      />

      <template #footer="{ close }">
        <BaseButton variant="outline" @click="close">Cancel</BaseButton>
        <BaseButton
          :variant="feedbackAction === 'REJECT' ? 'danger' : 'primary'"
          :isLoading="actionLoading"
          @click="onConfirmFeedback"
        >
          {{ feedbackAction === 'REJECT' ? 'Reject' : 'Request Changes' }}
        </BaseButton>
      </template>
    </BaseDialog>

    <!-- E-Signature Identity Verification Dialog -->
    <WorkflowInstanceEsignAuthDialog
      v-model="showEsignDialog"
      @verified="onEsignVerified"
    />
  </div>
</template>

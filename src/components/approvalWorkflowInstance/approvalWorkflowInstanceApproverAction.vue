<script setup>
import { useApprovalWorkflowInstances } from '@/composables/useApprovalWorkflowInstances.js'
import { post } from '@/api'
import { currentCompany } from '@/utils/currentCompany.js'
import { useQuasar } from 'quasar'

const props = defineProps({
  action: {
    type: String,
    required: true,
    validator: (value) => ['APPROVE', 'REJECT', 'REQUEST_CHANGES'].includes(value),
  },
  activeStep: { type: Object, required: true },
})

const emit = defineEmits(['done'])

const $q = useQuasar()
const { actionLoading, updateWorkflowStep } = useApprovalWorkflowInstances()
const approverAction = inject('approverAction', null)

// ── State ──────────────────────────────────────────────────────────────────────
const showFeedbackDialog = ref(false)
const showEsignDialog = ref(false)
const feedbackAction = ref('') // 'REJECT' or 'REQUEST_CHANGES'
const pendingAction = ref(null) // stores the action key to execute after e-sign
const comment = ref('')

const requireEsignature = computed(() => props.activeStep?.step?.requireEsignature)

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
    $q.notify({
      type: 'negative',
      message: errorMessages[esignError] || 'E-sign verification failed.',
    })
    return
  }

  if (esignCompleted) {
    const actionLabels = {
      APPROVE: 'approved',
      REJECT: 'rejected',
      REQUEST_CHANGES: 'changes requested',
    }
    $q.notify({
      type: 'positive',
      message: `Step ${actionLabels[esignCompleted] || 'action completed'} successfully`,
    })
    onDone()
  }
})

// ── Actions ────────────────────────────────────────────────────────────────────
function onDone() {
  if (typeof approverAction === 'function') approverAction()
  emit('done')
}

async function triggerEsignOrExecute(actionKey) {
  if (requireEsignature.value) {
    pendingAction.value = actionKey

    // Store context in server session (Redis) so the OAuth callback can execute the action
    await post('/v1/services/verify-identity/esign-context', {
      action: props.action,
      actionKey,
      feedbackAction: feedbackAction.value,
      workflowInstanceId: props.activeStep.workflowInstanceId,
      companyId: currentCompany.value.id,
      comment: feedbackAction.value === 'REJECT' ? comment.value : undefined,
    })

    showEsignDialog.value = true
  } else {
    executeAction(actionKey, {})
  }
}

/**
 * Called when the esign auth dialog emits verified credentials (password flow only).
 * OAuth flows are handled entirely by the server callback.
 */
function onEsignVerified(esign) {
  if (pendingAction.value) {
    executeAction(pendingAction.value, esign)
  }
}

/**
 * Central dispatcher — executes the workflow action with optional esign credentials.
 */
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

    await updateWorkflowStep(props.activeStep.workflowInstanceId, 'approve', payload)

    $q.notify({ type: 'positive', message: 'Step approved successfully' })
    showEsignDialog.value = false
    pendingAction.value = null
    onDone()
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

    const result = await updateWorkflowStep(props.activeStep.workflowInstanceId, action, payload)

    if (result.error) {
      $q.notify({ type: 'negative', message: result.error || `Failed to ${action} step` })
      return
    }

    $q.notify({ type: 'positive', message: `Step ${actionLabel} successfully` })
    showFeedbackDialog.value = false
    pendingAction.value = null
    comment.value = ''
    onDone()
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
    <WBtn
      v-if="action === 'APPROVE'"
      color="positive"
      unelevated
      class="tw:font-bold tw:shadow-md tw:shadow-primary/20!"
      :loading="actionLoading"
      @click="onApprove"
    >
      <WIcon name="verified" class="tw:mr-2" />
      Approve
    </WBtn>

    <WBtn
      v-if="action === 'REJECT'"
      outline
      class="tw:text-red-600! tw:border-red-200! tw:hover:bg-red-50! tw:font-bold"
      :loading="actionLoading"
      @click="onReject"
    >
      <WIcon name="cancel" class="tw:mr-2" />
      Reject
    </WBtn>

    <WBtn
      v-if="action === 'REQUEST_CHANGES'"
      outline
      class="tw:text-secondary tw:border-divider tw:hover:bg-main tw:font-bold"
      :loading="actionLoading"
      @click="onRequestChanges"
    >
      <WIcon name="edit_note" class="tw:mr-2" />
      Request Changes
    </WBtn>

    <!-- Feedback Dialog (Reject / Request Changes) -->
    <WDialog v-model="showFeedbackDialog" :title="dialogTitle" minWidth="500px" persistent>
      <p class="tw:text-sm tw:text-secondary tw:mb-0!">
        {{ dialogMessage }}
      </p>

      <WInput
        v-if="feedbackAction === 'REJECT'"
        v-model="comment"
        type="textarea"
        label="Comment (optional)"
        autogrow
        noDense
        class="tw:mt-4"
      />

      <template #actions>
        <WBtn flat label="Cancel" @click="showFeedbackDialog = false" />
        <WBtn
          :color="feedbackAction === 'REJECT' ? 'negative' : 'primary'"
          unelevated
          :label="feedbackAction === 'REJECT' ? 'Reject' : 'Request Changes'"
          :loading="actionLoading"
          @click="onConfirmFeedback"
        />
      </template>
    </WDialog>

    <!-- E-Signature Identity Verification Dialog -->
    <ApprovalWorkflowInstanceEsignAuthDialog
      v-model="showEsignDialog"
      @verified="onEsignVerified"
    />
  </div>
</template>

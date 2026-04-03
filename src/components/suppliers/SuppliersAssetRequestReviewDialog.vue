<script setup>
import { useQuasar } from 'quasar'
import { currentCompany } from '@/utils/currentCompany.js'
import { get, post } from '@/api'

const props = defineProps({
  assetRequestId: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['done'])

const show = defineModel({ type: Boolean, default: false })

const $q = useQuasar()

const assetRequest = ref(null)
const loading = ref(false)
const submitting = ref(false)
const action = ref(null) // 'accept' | 'reject'
const reviewNote = ref('')

watch(show, (val) => {
  if (val && props.assetRequestId) {
    fetchAssetRequest()
  } else {
    assetRequest.value = null
    action.value = null
    reviewNote.value = ''
  }
})

async function fetchAssetRequest() {
  const companyId = currentCompany.value?.id
  loading.value = true
  const result = await get(`/v1/services/assetRequests/${props.assetRequestId}`, {
    params: { companyId },
  })
  loading.value = false
  if (result.error) {
    $q.notify({ type: 'negative', message: result.error })
    show.value = false
    return
  }
  assetRequest.value = result.assetRequest
}

function selectAction(selected) {
  action.value = selected
  reviewNote.value = ''
}

async function onConfirm() {
  const companyId = currentCompany.value?.id
  if (!companyId || !action.value) return

  submitting.value = true

  let result
  if (action.value === 'accept') {
    result = await post(`/v1/services/assetRequests/${props.assetRequestId}/accept`, { companyId })
  } else {
    result = await post(`/v1/services/assetRequests/${props.assetRequestId}/reject`, {
      companyId,
      reviewNote: reviewNote.value,
    })
  }

  submitting.value = false

  if (result.error) {
    $q.notify({ type: 'negative', message: result.error })
    return
  }

  $q.notify({
    type: 'positive',
    message: action.value === 'accept' ? 'Document accepted' : 'Document rejected',
  })
  show.value = false
  emit('done')
}
</script>

<template>
  <WDialog v-model="show" title="Review Document" persistent>
    <div class="tw:p-4 tw:space-y-4">
      <!-- Loading -->
      <div v-if="loading" class="tw:flex tw:justify-center tw:py-8">
        <QSpinner color="primary" size="32px" />
      </div>

      <template v-else-if="assetRequest">
        <!-- Request summary -->
        <div class="tw:bg-main-hover tw:rounded-lg tw:p-3 tw:space-y-1">
          <p class="tw:text-sm tw:font-medium tw:text-on-main">{{ assetRequest.title }}</p>
          <p v-if="assetRequest.requestType" class="tw:text-xs tw:text-secondary">
            {{ assetRequest.requestType.name }}
          </p>
        </div>

        <!-- Uploaded document -->
        <div>
          <p
            class="tw:text-xs tw:font-semibold tw:text-secondary tw:uppercase tw:tracking-wide tw:mb-2"
          >
            Submitted Document
          </p>
          <div
            v-if="assetRequest.asset"
            class="tw:flex tw:items-center tw:gap-3 tw:p-3 tw:bg-main-hover tw:rounded-lg tw:border tw:border-divider"
          >
            <QIcon name="insert_drive_file" color="primary" size="sm" />
            <div class="tw:flex-1 tw:min-w-0">
              <p class="tw:text-sm tw:text-on-main tw:truncate">
                {{
                  assetRequest.asset.originalFilename || assetRequest.asset.filename || 'Document'
                }}
              </p>
              <p v-if="assetRequest.asset.mimeType" class="tw:text-xs tw:text-secondary">
                {{ assetRequest.asset.mimeType }}
              </p>
            </div>
            <WBtn
              v-if="assetRequest.asset.url"
              flat
              round
              dense
              icon="open_in_new"
              color="secondary"
              size="sm"
              :href="assetRequest.asset.url"
              target="_blank"
              title="Open file"
            />
          </div>
          <p v-else class="tw:text-sm tw:text-secondary tw:italic">No document uploaded yet.</p>
        </div>

        <!-- Action selection -->
        <div v-if="!action" class="tw:flex tw:gap-3">
          <WBtn
            class="tw:flex-1"
            color="positive"
            label="Accept"
            icon="check_circle"
            unelevated
            @click="selectAction('accept')"
          />
          <WBtn
            class="tw:flex-1"
            color="negative"
            label="Reject"
            icon="cancel"
            outline
            @click="selectAction('reject')"
          />
        </div>

        <!-- Accept confirmation -->
        <div v-else-if="action === 'accept'" class="tw:space-y-3">
          <div
            class="tw:flex tw:items-center tw:gap-2 tw:p-3 tw:bg-green-50 tw:rounded-lg tw:border tw:border-green-200"
          >
            <QIcon name="check_circle" color="positive" size="sm" />
            <p class="tw:text-sm tw:text-on-main">
              The document will be marked as <strong>Accepted</strong> and the supplier will be
              notified.
            </p>
          </div>
          <WBtn flat label="Back" size="sm" @click="action = null" />
        </div>

        <!-- Reject form -->
        <div v-else-if="action === 'reject'" class="tw:space-y-3">
          <div
            class="tw:flex tw:items-center tw:gap-2 tw:p-3 tw:bg-red-50 tw:rounded-lg tw:border tw:border-red-200"
          >
            <QIcon name="cancel" color="negative" size="sm" />
            <p class="tw:text-sm tw:text-on-main">
              Please provide a reason for rejection. This will be included in the email to the
              supplier.
            </p>
          </div>
          <QInput
            v-model="reviewNote"
            label="Rejection reason"
            type="textarea"
            outlined
            dense
            autogrow
            :rows="3"
          />
          <WBtn flat label="Back" size="sm" @click="action = null" />
        </div>
      </template>
    </div>

    <template #actions>
      <WBtn flat label="Cancel" @click="show = false" />
      <WBtn
        v-if="action === 'accept'"
        color="positive"
        label="Confirm Accept"
        unelevated
        :loading="submitting"
        @click="onConfirm"
      />
      <WBtn
        v-else-if="action === 'reject'"
        color="negative"
        label="Confirm Reject"
        unelevated
        :loading="submitting"
        :disable="!reviewNote.trim()"
        @click="onConfirm"
      />
    </template>
  </WDialog>
</template>

<script setup>
import { get, post, upload } from '@/api'

const route = useRoute()
const token = route.params.token

const assetRequest = ref(null)
const loading = ref(true)
const error = ref(null)
const expired = ref(false)
const success = ref(false)

const selectedFile = ref(null)
const uploading = ref(false)
const uploadProgress = ref(0)
const submitting = ref(false)

async function fetchAssetRequest() {
  try {
    const data = await get(`/v1/services/public/assetRequests/${token}`, {
      loader: loading,
      showError: false,
    })
    assetRequest.value = data.assetRequest
  } catch (err) {
    if (err.response?.status === 410) {
      expired.value = true
    } else {
      error.value = err.response?.data?.error || err.message
    }
  }
}

function onFileSelect(event) {
  const file = event.target.files?.[0]
  if (file) {
    selectedFile.value = file
  }
}

function removeFile() {
  selectedFile.value = null
  uploadProgress.value = 0
}

async function onSubmit() {
  if (!selectedFile.value) return

  submitting.value = true
  uploading.value = true

  try {
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    formData.append('fileType', 'ASSET')

    const uploadData = await upload(`/v1/services/public/assetRequests/${token}/upload`, formData, {
      showError: false,
      onUpload: (progressEvent) => {
        uploadProgress.value = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1))
      },
    })

    uploading.value = false

    await post(
      `/v1/services/public/assetRequests/${token}/submit`,
      {
        assetId: uploadData.asset.id,
      },
      { showError: false },
    )

    success.value = true
  } catch (err) {
    if (err.response?.status === 410) {
      expired.value = true
    } else {
      error.value = err.response?.data?.error || err.message
    }
  } finally {
    submitting.value = false
    uploading.value = false
  }
}

function formatFileSize(bytes) {
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${bytes} bytes`
}

onMounted(() => {
  if (token) {
    fetchAssetRequest()
  } else {
    error.value = 'Invalid link'
    loading.value = false
  }
})
</script>

<template>
  <div class="tw:flex tw:flex-col tw:min-h-screen tw:bg-main">
    <div class="tw:flex-1 tw:flex tw:items-center tw:justify-center">
      <div class="tw:w-full tw:max-w-150 tw:bg-sidebar tw:rounded-lg tw:shadow-lg tw:p-6 tw:m-4">
        <!-- Loading -->
        <div v-if="loading" class="tw:text-center tw:py-16">
          <QSpinner color="primary" size="3em" />
          <div class="tw:text-secondary tw:mt-4">Loading...</div>
        </div>

        <!-- Expired -->
        <div v-else-if="expired" class="tw:text-center tw:py-16">
          <WIcon icon="schedule" class="tw:text-warning" size="4em" />
          <div class="tw:text-2xl tw:mt-4 tw:text-on-sidebar">Link Expired</div>
          <p class="tw:text-secondary tw:mt-2">
            This link has expired or the document has already been submitted.
          </p>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="tw:text-center tw:py-16">
          <WIcon icon="error_outline" class="tw:text-bad" size="4em" />
          <div class="tw:text-xl tw:mt-4 tw:text-bad">{{ error }}</div>
        </div>

        <!-- Success -->
        <div v-else-if="success" class="tw:text-center tw:py-16">
          <WIcon icon="check_circle" class="tw:text-good" size="4em" />
          <div class="tw:text-2xl tw:mt-4 tw:text-good">Document Submitted!</div>
          <p class="tw:text-secondary tw:mt-2">
            Thank you. Your document has been received successfully.
          </p>
        </div>

        <!-- Form -->
        <div v-else-if="assetRequest">
          <div class="tw:text-2xl tw:font-bold tw:mb-2 tw:text-center tw:text-on-sidebar">
            Document Request
          </div>
          <p class="tw:text-center tw:text-secondary tw:mb-6">
            Please upload the requested document below.
          </p>

          <!-- Request details -->
          <div class="tw:bg-main tw:rounded-lg tw:p-4 tw:mb-6">
            <div class="tw:space-y-2">
              <div class="tw:flex tw:gap-2">
                <span class="tw:text-secondary tw:w-24 tw:shrink-0">Title</span>
                <span class="tw:text-on-sidebar tw:font-medium">{{ assetRequest.title }}</span>
              </div>
              <div v-if="assetRequest.requestType" class="tw:flex tw:gap-2">
                <span class="tw:text-secondary tw:w-24 tw:shrink-0">Type</span>
                <span class="tw:text-on-sidebar">{{ assetRequest.requestType.name }}</span>
              </div>
              <div v-if="assetRequest.description" class="tw:flex tw:gap-2">
                <span class="tw:text-secondary tw:w-24 tw:shrink-0">Description</span>
                <span class="tw:text-on-sidebar">{{ assetRequest.description }}</span>
              </div>
              <div v-if="assetRequest.dueDate" class="tw:flex tw:gap-2">
                <span class="tw:text-secondary tw:w-24 tw:shrink-0">Due Date</span>
                <span class="tw:text-on-sidebar">{{ assetRequest.dueDate }}</span>
              </div>
            </div>
          </div>

          <!-- File upload -->
          <div class="tw:mb-6">
            <label class="tw:block tw:text-sm tw:font-medium tw:text-on-sidebar tw:mb-2">
              Upload Document *
            </label>

            <div
              v-if="!selectedFile"
              class="tw:border-2 tw:border-dashed tw:border-gray-300 tw:rounded-lg tw:p-8 tw:text-center tw:cursor-pointer tw:hover:border-primary tw:transition-colors"
              @click="$refs.fileInput.click()"
            >
              <WIcon icon="cloud_upload" size="3em" class="tw:text-secondary" />
              <p class="tw:text-secondary tw:mt-2">Click to select a file</p>
              <p class="tw:text-xs tw:text-secondary tw:mt-1">
                PDF, Word, Excel, Images (max 100 MB)
              </p>
            </div>

            <div
              v-else
              class="tw:border tw:border-gray-300 tw:rounded-lg tw:p-4 tw:flex tw:items-center tw:gap-3"
            >
              <WIcon icon="description" size="2em" class="tw:text-primary" />
              <div class="tw:flex-1 tw:min-w-0">
                <div class="tw:text-on-sidebar tw:truncate">{{ selectedFile.name }}</div>
                <div class="tw:text-xs tw:text-secondary">
                  {{ formatFileSize(selectedFile.size) }}
                </div>
              </div>
              <QBtn flat round dense icon="close" :disable="submitting" @click="removeFile" />
            </div>

            <input
              ref="fileInput"
              type="file"
              class="tw:hidden"
              accept="image/*,application/pdf,.docx,.doc,.xlsx,.xls,.csv"
              @change="onFileSelect"
            />

            <!-- Upload progress -->
            <QLinearProgress
              v-if="uploading"
              :value="uploadProgress / 100"
              color="primary"
              class="tw:mt-2"
            />
          </div>

          <!-- Submit button -->
          <div class="tw:flex tw:justify-end">
            <WBtn
              label="Submit Document"
              color="primary"
              :loading="submitting"
              :disable="!selectedFile"
              unelevated
              @click="onSubmit"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<route lang="yaml">
meta:
  layout: empty
</route>

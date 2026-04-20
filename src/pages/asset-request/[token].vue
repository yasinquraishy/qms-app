<script setup>
import {
  IconAlertCircle,
  IconCircleCheck,
  IconClock,
  IconCloudUpload,
  IconFileText,
  IconX,
} from '@tabler/icons-vue'
import { get, upload } from '@/api'

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
  } catch {
    expired.value = true
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

    await upload(`/v1/services/public/assetRequests/${token}/upload`, formData, {
      showError: false,
      onUpload: (progressEvent) => {
        uploadProgress.value = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1))
      },
    })

    uploading.value = false
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
          <div
            class="tw:size-12 tw:animate-spin tw:rounded-full tw:border-4 tw:border-primary tw:border-t-transparent tw:mx-auto"
          ></div>
          <div class="tw:text-secondary tw:mt-4">Loading...</div>
        </div>

        <!-- Expired -->
        <div v-else-if="expired" class="tw:text-center tw:py-16">
          <IconClock :size="64" class="tw:text-warning tw:mx-auto" />
          <div class="tw:text-2xl tw:mt-4 tw:text-on-sidebar">Link Expired</div>
          <p class="tw:text-secondary tw:mt-2">
            This link has expired or the document has already been submitted.
          </p>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="tw:text-center tw:py-16">
          <IconAlertCircle :size="64" class="tw:text-bad tw:mx-auto" />
          <div class="tw:text-xl tw:mt-4 tw:text-bad">{{ error }}</div>
        </div>

        <!-- Success -->
        <div v-else-if="success" class="tw:text-center tw:py-16">
          <IconCircleCheck :size="64" class="tw:text-good tw:mx-auto" />
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
              <IconCloudUpload :size="48" class="tw:text-secondary tw:mx-auto" />
              <p class="tw:text-secondary tw:mt-2">Click to select a file</p>
              <p class="tw:text-xs tw:text-secondary tw:mt-1">
                PDF, Word, Excel, Images (max 100 MB)
              </p>
            </div>

            <div
              v-else
              class="tw:border tw:border-gray-300 tw:rounded-lg tw:p-4 tw:flex tw:items-center tw:gap-3"
            >
              <IconFileText :size="32" class="tw:text-primary" />
              <div class="tw:flex-1 tw:min-w-0">
                <div class="tw:text-on-sidebar tw:truncate">{{ selectedFile.name }}</div>
                <div class="tw:text-xs tw:text-secondary">
                  {{ formatFileSize(selectedFile.size) }}
                </div>
              </div>
              <button
                class="tw:p-1.5 tw:rounded-full tw:text-secondary tw:hover:text-on-main tw:hover:bg-main-hover tw:transition-colors tw:bg-transparent tw:border-0 tw:cursor-pointer"
                :disabled="submitting"
                @click="removeFile"
              >
                <IconX :size="18" />
              </button>
            </div>

            <input
              ref="fileInput"
              type="file"
              class="tw:hidden"
              accept="image/*,application/pdf,.docx,.doc,.xlsx,.xls,.csv"
              @change="onFileSelect"
            />

            <!-- Upload progress -->
            <div
              v-if="uploading"
              class="tw:mt-2 tw:h-1.5 tw:bg-gray-200 tw:rounded-full tw:overflow-hidden"
            >
              <div
                class="tw:h-full tw:bg-primary tw:rounded-full tw:transition-all tw:duration-200"
                :style="{ width: uploadProgress + '%' }"
              ></div>
            </div>
          </div>

          <!-- Submit button -->
          <div class="tw:flex tw:justify-end">
            <button
              class="tw:py-2.5 tw:px-6 tw:rounded-lg tw:bg-primary tw:text-white tw:font-medium tw:text-sm tw:hover:opacity-90 tw:transition-opacity tw:cursor-pointer tw:border-0 disabled:tw:opacity-50 disabled:tw:cursor-not-allowed"
              :disabled="submitting || !selectedFile"
              @click="onSubmit"
            >
              <span v-if="submitting" class="tw:inline-flex tw:items-center tw:gap-2">
                <span
                  class="tw:size-4 tw:animate-spin tw:rounded-full tw:border-2 tw:border-white tw:border-t-transparent tw:inline-block"
                ></span>
                Submitting...
              </span>
              <span v-else>Submit Document</span>
            </button>
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

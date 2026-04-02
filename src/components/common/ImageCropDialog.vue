<script setup>
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'

const props = defineProps({
  currentImageUrl: {
    type: String,
    default: null,
  },
  title: {
    type: String,
    default: 'Edit Image',
  },
  aspectRatio: {
    type: Number,
    default: 1,
  },
  maxSize: {
    type: Number,
    default: 2048, // Max width/height in pixels
  },
})

const emit = defineEmits(['save', 'delete'])

const model = defineModel({ type: Boolean, default: false })

const selectedImage = ref(null)
const cropper = ref(null)
const processing = ref(false)

const hasCurrentImage = computed(() => !!props.currentImageUrl)

// Select Image File
function selectImage() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'

  input.onchange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      selectedImage.value = e.target.result
    }
    reader.readAsDataURL(file)
  }

  input.click()
}

// Save Cropped Image
async function save() {
  if (!cropper.value) return

  processing.value = true

  try {
    const { canvas } = cropper.value.getResult()

    // Resize if needed
    let finalCanvas = canvas
    if (canvas.width > props.maxSize || canvas.height > props.maxSize) {
      const scale = Math.min(props.maxSize / canvas.width, props.maxSize / canvas.height)
      const resizeCanvas = document.createElement('canvas')
      resizeCanvas.width = canvas.width * scale
      resizeCanvas.height = canvas.height * scale
      const ctx = resizeCanvas.getContext('2d')
      ctx.drawImage(canvas, 0, 0, resizeCanvas.width, resizeCanvas.height)
      finalCanvas = resizeCanvas
    }

    // Convert canvas to blob
    const blob = await new Promise((resolve) => {
      finalCanvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.9)
    })

    // Create file from blob
    const file = new File([blob], 'image.jpg', { type: 'image/jpeg' })

    emit('save', { file, blob, canvas: finalCanvas })

    selectedImage.value = null
  } catch (err) {
    console.error('Error processing image:', err)
    alert('Failed to process image. Please try again.')
  } finally {
    processing.value = false
  }
}

// Delete Image
function deleteImage() {
  emit('delete')
}

// Cancel
function cancel() {
  selectedImage.value = null
  model.value = false
}

// Reset when dialog closes
watch(model, (newVal) => {
  if (!newVal) {
    selectedImage.value = null
    processing.value = false
  }
})
</script>

<template>
  <WDialog v-model="model" :title="title">
    <div class="tw:space-y-6">
      <!-- Show Cropper when image is selected -->
      <div v-if="selectedImage" class="tw:space-y-4">
        <div class="tw:h-96 tw:bg-main tw:rounded-lg tw:overflow-hidden">
          <Cropper
            ref="cropper"
            :src="selectedImage"
            :stencilProps="{
              aspectRatio,
            }"
            class="tw:h-full"
          />
        </div>
        <p class="tw:text-xs tw:text-center tw:text-secondary">
          Adjust the crop area. Image will be saved as {{ aspectRatio }}:1 aspect ratio.
        </p>
      </div>

      <!-- Show Current Image Preview when no image selected -->
      <div v-else-if="hasCurrentImage" class="tw:flex tw:flex-col tw:items-center tw:gap-4 tw:py-4">
        <img
          :src="currentImageUrl"
          alt="Current image"
          class="tw:size-32 tw:rounded-lg tw:object-cover tw:border tw:border-divider"
        />
        <div class="tw:text-center">
          <p class="tw:text-xs tw:text-secondary">Current image</p>
        </div>
      </div>

      <!-- No image state -->
      <div v-else class="tw:flex tw:flex-col tw:items-center tw:gap-4 tw:py-8">
        <div
          class="tw:size-32 tw:rounded-lg tw:bg-main tw:flex tw:items-center tw:justify-center tw:border tw:border-divider"
        >
          <QIcon name="image" size="48px" class="tw:text-secondary" />
        </div>
        <p class="tw:text-xs tw:text-secondary">No image selected</p>
      </div>

      <!-- Action Buttons -->
      <div class="tw:grid tw:grid-cols-1 tw:gap-3">
        <WBtn
          v-if="selectedImage"
          label="Save"
          icon="save"
          color="primary"
          unelevated
          class="tw:w-full"
          :loading="processing"
          @click="save"
        />
        <WBtn
          v-else
          label="Upload New Image"
          icon="cloud_upload"
          color="primary"
          unelevated
          class="tw:w-full"
          @click="selectImage"
        />
        <WBtn
          v-if="hasCurrentImage && !selectedImage"
          label="Delete Image"
          icon="delete"
          color="negative"
          outline
          class="tw:w-full"
          @click="deleteImage"
        />
        <WBtn label="Cancel" flat color="secondary" class="tw:w-full" @click="cancel" />
      </div>
    </div>
  </WDialog>
</template>

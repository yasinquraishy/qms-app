<script setup>
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'

const emit = defineEmits(['confirm'])

const model = defineModel({ type: Boolean, default: false })

const imageSrc = ref(null)
const cropper = ref(null)
const processing = ref(false)
const outputWidth = ref(null)
const outputHeight = ref(null)
const lockAspect = ref(false)
const naturalWidth = ref(0)
const naturalHeight = ref(0)

function open(file) {
  if (!file) return

  if (file.size > 10 * 1024 * 1024) {
    alert('File size must be less than 10MB')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    imageSrc.value = e.target.result

    const img = new window.Image()
    img.onload = () => {
      naturalWidth.value = img.naturalWidth
      naturalHeight.value = img.naturalHeight
      outputWidth.value = img.naturalWidth
      outputHeight.value = img.naturalHeight
    }
    img.src = e.target.result
  }
  reader.readAsDataURL(file)
  model.value = true
}

function onWidthChange(val) {
  const w = parseInt(val)
  if (!w || w <= 0) return
  outputWidth.value = w
  if (lockAspect.value && naturalWidth.value) {
    outputHeight.value = Math.round(w * (naturalHeight.value / naturalWidth.value))
  }
}

function onHeightChange(val) {
  const h = parseInt(val)
  if (!h || h <= 0) return
  outputHeight.value = h
  if (lockAspect.value && naturalHeight.value) {
    outputWidth.value = Math.round(h * (naturalWidth.value / naturalHeight.value))
  }
}

async function confirm() {
  if (!cropper.value) return

  processing.value = true
  try {
    const { canvas } = cropper.value.getResult()

    const targetW = outputWidth.value || canvas.width
    const targetH = outputHeight.value || canvas.height

    let finalCanvas = canvas
    if (targetW !== canvas.width || targetH !== canvas.height) {
      const resizeCanvas = document.createElement('canvas')
      resizeCanvas.width = targetW
      resizeCanvas.height = targetH
      const ctx = resizeCanvas.getContext('2d')
      ctx.drawImage(canvas, 0, 0, targetW, targetH)
      finalCanvas = resizeCanvas
    }

    const blob = await new Promise((resolve) => {
      finalCanvas.toBlob((b) => resolve(b), 'image/png', 0.92)
    })

    const file = new File([blob], 'editor-image.png', { type: 'image/png' })
    emit('confirm', file)
    model.value = false
  } catch (err) {
    console.error('Error processing image:', err)
  } finally {
    processing.value = false
  }
}

function cancel() {
  model.value = false
}

watch(model, (val) => {
  if (!val) {
    imageSrc.value = null
    processing.value = false
    outputWidth.value = null
    outputHeight.value = null
    lockAspect.value = false
  }
})

defineExpose({ open })
</script>

<template>
  <QDialog v-model="model" @hide="model = false">
    <QCard class="tw:min-w-135 tw:max-w-[90vw]">
      <QCardSection class="tw:flex tw:items-center tw:justify-between">
        <div class="tw:text-lg tw:font-semibold">Edit Image</div>
        <WBtn flat round dense icon="close" @click="cancel" />
      </QCardSection>

      <QCardSection class="tw:space-y-4 tw:pt-0!">
        <!-- Cropper -->
        <div v-if="imageSrc" class="tw:h-80 tw:bg-main tw:rounded-lg tw:overflow-hidden">
          <Cropper ref="cropper" :src="imageSrc" class="tw:h-full" />
        </div>

        <!-- Dimension Controls -->
        <div class="tw:flex tw:items-end tw:gap-3">
          <WInput
            :modelValue="outputWidth"
            label="Width (px)"
            type="number"
            outlined
            dense
            class="tw:flex-1"
            @update:modelValue="onWidthChange"
          />

          <WBtn
            flat
            dense
            :icon="lockAspect ? 'lock' : 'lock_open'"
            :title="lockAspect ? 'Unlock aspect ratio' : 'Lock aspect ratio'"
            class="tw:min-w-9! tw:min-h-9! tw:mb-0.5"
            :class="lockAspect ? 'tw:text-primary!' : 'tw:text-secondary!'"
            @click="lockAspect = !lockAspect"
          />

          <WInput
            :modelValue="outputHeight"
            label="Height (px)"
            type="number"
            outlined
            dense
            class="tw:flex-1"
            @update:modelValue="onHeightChange"
          />
        </div>
        <p class="tw:text-xs tw:text-secondary">
          Drag to crop. Adjust width and height to resize the output.
        </p>
      </QCardSection>

      <QCardActions class="tw:justify-end tw:px-4 tw:pb-4">
        <WBtn flat label="Cancel" color="secondary" @click="cancel" />
        <WBtn
          unelevated
          label="Insert Image"
          icon="check"
          color="primary"
          :loading="processing"
          @click="confirm"
        />
      </QCardActions>
    </QCard>
  </QDialog>
</template>

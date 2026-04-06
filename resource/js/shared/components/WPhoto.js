import { QBtn, QDialog, QCard, QCardSection, QCardActions, QIcon, QImg, QFile } from 'quasar'
import { defineComponent, h, ref, computed, onBeforeUnmount } from 'vue'
import { forwardRefs } from '@shared/composables/forwardRef'
import { useRender } from '@shared/composables/render'

export default defineComponent({
  name: 'WPhoto',
  inheritAttrs: false,
  props: {
    /**
     * Mode for photo input:
     * - 'both': Allow both camera capture and file upload (default)
     * - 'camera': Only allow camera capture
     * - 'upload': Only allow file upload
     */
    mode: {
      type: String,
      default: 'both',
      validator: (value) => ['both', 'camera', 'upload'].includes(value),
    },

    modelValue: {
      type: [String, File, null],
      default: null,
    },
    /**
     * Maximum file size in bytes
     */
    maxFileSize: {
      type: Number,
      default: 5 * 1024 * 1024, // 5MB default
    },
    /**
     * Placeholder text when no image is selected
     */
    placeholder: {
      type: String,
      default: 'Add Photo',
    },
    /**
     * Size of the preview image
     */
    previewSize: {
      type: String,
      default: '150px',
    },
    /**
     * Whether the component is disabled
     */
    disabled: {
      type: Boolean,
      default: false,
    },
    /**
     * Whether the component is in readonly mode
     */
    readonly: {
      type: Boolean,
      default: false,
    },
    /**
     * Camera facing mode: 'user' (front) or 'environment' (back)
     */
    facingMode: {
      type: String,
      default: 'environment',
      validator: (value) => ['user', 'environment'].includes(value),
    },
  },
  emits: ['update:modelValue', 'error', 'capture', 'upload'],
  setup(props, { attrs, emit }) {
    const root = ref()
    const fileInputRef = ref()
    const videoRef = ref()
    const canvasRef = ref()
    const cameraDialogOpen = ref(false)
    const stream = ref(null)
    const previewUrl = ref(null)
    const cameraError = ref(null)

    // Computed preview URL from modelValue or captured image
    const displayUrl = computed(() => {
      if (props.modelValue instanceof File) {
        return URL.createObjectURL(props.modelValue)
      }
      if (typeof props.modelValue === 'string' && props.modelValue) {
        return props.modelValue
      }
      return previewUrl.value
    })

    const hasImage = computed(() => !!displayUrl.value)

    const showCameraButton = computed(() => 
      ['both', 'camera'].includes(props.mode) && !props.disabled && !props.readonly
    )

    const showUploadButton = computed(() => 
      ['both', 'upload'].includes(props.mode) && !props.disabled && !props.readonly
    )

    // Start camera stream
    async function startCamera() {
      cameraError.value = null
      try {
        const constraints = {
          video: {
            facingMode: props.facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        }
        stream.value = await navigator.mediaDevices.getUserMedia(constraints)
        
        // Wait for dialog to open and video element to be available
        setTimeout(() => {
          if (videoRef.value) {
            videoRef.value.srcObject = stream.value
            videoRef.value.play()
          }
        }, 100)
      } catch (error) {
        console.error('Camera access error:', error)
        cameraError.value = getCameraErrorMessage(error)
        emit('error', { type: 'camera', error })
      }
    }

    function getCameraErrorMessage(error) {
      if (error.name === 'NotAllowedError') {
        return 'Camera access denied. Please allow camera permissions.'
      }
      if (error.name === 'NotFoundError') {
        return 'No camera found on this device.'
      }
      if (error.name === 'NotReadableError') {
        return 'Camera is already in use by another application.'
      }
      return 'Unable to access camera. Please try again.'
    }

    // Stop camera stream
    function stopCamera() {
      if (stream.value) {
        stream.value.getTracks().forEach((track) => track.stop())
        stream.value = null
      }
    }

    // Open camera dialog
    function openCamera() {
      if (props.disabled || props.readonly) return
      cameraDialogOpen.value = true
      startCamera()
    }

    // Close camera dialog
    function closeCamera() {
      stopCamera()
      cameraDialogOpen.value = false
      cameraError.value = null
    }

    // Capture photo from video stream
    function capturePhoto() {
      if (!videoRef.value || !canvasRef.value) return

      const video = videoRef.value
      const canvas = canvasRef.value
      const context = canvas.getContext('2d')

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Convert to blob and create file
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' })
            previewUrl.value = URL.createObjectURL(blob)
            emit('update:modelValue', file)
            emit('capture', file)
            closeCamera()
          }
        },
        'image/jpeg',
        0.9
      )
    }

    // Handle file upload
    function handleFileUpload(file) {
      if (!file) return

      // Validate file size
      if (file.size > props.maxFileSize) {
        emit('error', {
          type: 'fileSize',
          message: `File size exceeds ${Math.round(props.maxFileSize / 1024 / 1024)}MB limit`,
        })
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        emit('error', {
          type: 'fileType',
          message: 'Please select an image file',
        })
        return
      }

      previewUrl.value = URL.createObjectURL(file)
      emit('update:modelValue', file)
      emit('upload', file)
    }

    // Trigger file input click
    function triggerFileInput() {
      if (props.disabled || props.readonly) return
      fileInputRef.value?.pickFiles()
    }

    // Clear the current image
    function clearImage() {
      if (props.disabled || props.readonly) return
      if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value)
      }
      previewUrl.value = null
      emit('update:modelValue', null)
    }

    // Cleanup on unmount
    onBeforeUnmount(() => {
      stopCamera()
      if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value)
      }
    })

    // Render camera dialog
    const CameraDialog = () =>
      h(
        QDialog,
        {
          modelValue: cameraDialogOpen.value,
          'onUpdate:modelValue': (val) => {
            if (!val) closeCamera()
          },
          persistent: true,
        },
        () =>
          h(QCard, { class: 'w-photo-camera-dialog', style: { minWidth: '320px' } }, () => [
            h(QCardSection, { class: 'q-pa-none' }, () => [
              cameraError.value
                ? h(
                    'div',
                    {
                      class: 'w-photo-camera-error q-pa-lg text-center text-negative',
                    },
                    [
                      h(QIcon, { name: 'sym_r_error', size: '48px', class: 'q-mb-md' }),
                      h('div', {}, cameraError.value),
                    ]
                  )
                : h('video', {
                    ref: videoRef,
                    class: 'w-photo-video',
                    autoplay: true,
                    playsinline: true,
                    muted: true,
                    style: {
                      width: '100%',
                      maxHeight: '60vh',
                      objectFit: 'cover',
                      display: 'block',
                      backgroundColor: '#000',
                    },
                  }),
              // Hidden canvas for capturing
              h('canvas', {
                ref: canvasRef,
                style: { display: 'none' },
              }),
            ]),
            h(
              QCardActions,
              { align: 'center', class: 'q-pa-md' },
              () => [
                h(
                  QBtn,
                  {
                    flat: true,
                    label: 'Cancel',
                    color: 'grey',
                    onClick: closeCamera,
                  }
                ),
                !cameraError.value &&
                  h(
                    QBtn,
                    {
                      unelevated: true,
                      label: 'Capture',
                      color: 'primary',
                      icon: 'sym_r_photo_camera',
                      onClick: capturePhoto,
                    }
                  ),
              ].filter(Boolean)
            ),
          ])
      )

    // Render preview image
    const PreviewImage = () =>
      h(
        'div',
        {
          class: 'w-photo-preview',
          style: {
            width: props.previewSize,
            height: props.previewSize,
            position: 'relative',
          },
        },
        [
          h(QImg, {
            src: displayUrl.value,
            fit: 'cover',
            style: {
              width: '100%',
              height: '100%',
              borderRadius: '8px',
            },
          }),
          !props.disabled &&
            !props.readonly &&
            h(
              QBtn,
              {
                round: true,
                dense: true,
                flat: true,
                icon: 'sym_r_close',
                color: 'white',
                class: 'w-photo-clear-btn',
                style: {
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                },
                onClick: clearImage,
              }
            ),
        ].filter(Boolean)
      )

    // Render placeholder with action buttons
    const Placeholder = () =>
      h(
        'div',
        {
          class: [
            'w-photo-placeholder',
            'column no-wrap',
            'items-center',
            'justify-center',
            'q-pa-md',
            { 'cursor-pointer': !props.disabled && !props.readonly },
          ],
          style: {
            width: props.previewSize,
            height: props.previewSize,
            border: '2px dashed #ccc',
            borderRadius: '8px',
            backgroundColor: '#f5f5f5',
          },
        },
        [
          h(QIcon, {
            name: 'sym_r_add_a_photo',
            size: '32px',
            color: 'grey-6',
            class: 'q-mb-sm',
          }),
          h(
            'div',
            { class: 'text-caption text-grey-6 text-center q-mb-xs' },
            props.placeholder
          ),
          h('div', { class: 'row q-gutter-x-sm justify-center' }, [
            showCameraButton.value &&
              h(
                QBtn,
                {
                  dense: true,
                  flat: true,
                  round: true,
                  icon: 'sym_r_photo_camera',
                  color: 'primary',
                  onClick: (e) => {
                    e.stopPropagation()
                    openCamera()
                  },
                }
              ),
            showUploadButton.value &&
              h(
                QBtn,
                {
                  dense: true,
                  flat: true,
                  round: true,
                  icon: 'sym_r_upload',
                  color: 'primary',
                  onClick: (e) => {
                    e.stopPropagation()
                    triggerFileInput()
                  },
                }
              ),
          ].filter(Boolean)),
        ]
      )

    // Hidden file input
    const FileInput = () =>
      h(QFile, {
        ref: fileInputRef,
        accept: 'image/*',
        style: { display: 'none' },
        'onUpdate:modelValue': handleFileUpload,
      })

    useRender(() =>
      h(
        'div',
        {
          ...attrs,
          class: [
            'w-photo',
            attrs.class,
            {
              'w-photo--disabled': props.disabled,
              'w-photo--readonly': props.readonly,
            },
          ],
          ref: root,
        },
        [
          hasImage.value ? PreviewImage() : Placeholder(),
          FileInput(),
          CameraDialog(),
        ]
      )
    )

    return forwardRefs(
      {
        openCamera,
        triggerFileInput,
        clearImage,
        capturePhoto,
      },
      root
    )
  },
})

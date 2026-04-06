<script setup>
const props = defineProps({
  state: {
    type: String,
    required: true,
    validator: (value) => ['uploaded', 'pending', 'uploading', 'success', 'error'].includes(value),
  },
  fileName: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  progress: {
    type: Number,
    default: 0,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  fileUrl: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['remove'])

// Helper function to get file icon and color based on file type
function getFileIcon(fileName) {
  const ext = fileName.split('.').pop().toLowerCase()
  const iconMap = {
    pdf: { icon: 'picture_as_pdf', color: 'tw:bg-bad/10 tw:text-bad' },
    doc: { icon: 'description', color: 'tw:bg-primary/10 tw:text-primary' },
    docx: { icon: 'description', color: 'tw:bg-primary/10 tw:text-primary' },
    png: { icon: 'image', color: 'tw:bg-warn/10 tw:text-warn' },
    jpg: { icon: 'image', color: 'tw:bg-warn/10 tw:text-warn' },
    jpeg: { icon: 'image', color: 'tw:bg-warn/10 tw:text-warn' },
  }
  return iconMap[ext] || { icon: 'description', color: 'tw:bg-primary/10 tw:text-primary' }
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const containerClass = computed(() => {
  const baseClass = 'tw:rounded-lg tw:border'
  const cursorClass = props.fileUrl ? ' tw:cursor-pointer' : ''

  switch (props.state) {
    case 'uploaded':
      return `${baseClass} tw:border-good/20 tw:bg-good/10 tw:hover:bg-good/20 tw:transition-colors${cursorClass}`
    case 'success':
    case 'error':
      return `${baseClass} tw:border-divider tw:bg-sidebar tw:hover:bg-primary/5 tw:transition-colors${cursorClass}`
    default:
      return `${baseClass} tw:border-divider tw:bg-sidebar${cursorClass}`
  }
})

const statusBadge = computed(() => {
  switch (props.state) {
    case 'uploaded':
      return {
        text: 'Uploaded',
        icon: 'sym_o_check_circle',
        class: 'tw:text-good',
      }
    case 'success':
      return {
        text: 'Success',
        icon: 'sym_o_check_circle',
        class: 'tw:text-good',
      }
    case 'error':
      return {
        text: 'Failed',
        icon: 'sym_o_error',
        class: 'tw:text-bad',
      }
    default:
      return null
  }
})

const deleteIcon = computed(() => {
  return props.state === 'uploading' ? 'sym_o_close' : 'sym_o_delete_outline'
})

const showDeleteButton = computed(() => {
  if (props.readonly) return false
  if (props.state === 'uploaded' && props.disabled) return false
  return true
})

function handleRemove() {
  emit('remove')
}

function handleClick() {
  if (props.fileUrl) {
    window.open(props.fileUrl, '_blank', 'noopener,noreferrer')
  }
}
</script>

<template>
  <div :class="containerClass" @click.prevent.stop="handleClick">
    <!-- Uploading State with Progress Bar -->
    <div v-if="state === 'uploading'" class="tw:flex tw:flex-col tw:gap-2 tw:p-3">
      <div class="tw:flex tw:items-center tw:justify-between tw:gap-3">
        <div class="tw:flex tw:items-center tw:gap-3 tw:overflow-hidden">
          <div
            :class="getFileIcon(fileName).color"
            class="tw:flex tw:items-center tw:justify-center tw:shrink-0 tw:w-8 tw:h-8 tw:rounded"
          >
            <QIcon :name="`sym_o_${getFileIcon(fileName).icon}`" class="tw:text-lg" />
          </div>
          <div class="tw:flex tw:flex-col tw:overflow-hidden">
            <span
              class="tw:text-xs tw:font-medium tw:text-on-sidebar tw:truncate"
              :title="fileName"
            >
              {{ fileName }}
            </span>
            <span class="tw:text-[10px] tw:text-secondary">
              {{ formatFileSize(fileSize) }} • Uploading...
            </span>
          </div>
        </div>
        <WBtn v-if="showDeleteButton" flat dense @click.stop="handleRemove">
          <QIcon :name="deleteIcon" class="tw:text-lg" />
        </WBtn>
      </div>
      <!-- Progress Bar -->
      <div class="tw:w-full tw:bg-primary/5 tw:rounded-full tw:h-1 tw:overflow-hidden">
        <div
          class="tw:bg-primary tw:h-full tw:rounded-full tw:transition-all tw:duration-300"
          :style="{ width: `${progress}%` }"
        ></div>
      </div>
    </div>

    <!-- All Other States -->
    <div v-else class="tw:flex tw:items-center tw:justify-between tw:gap-3 tw:p-3">
      <div class="tw:flex tw:items-center tw:gap-3 tw:overflow-hidden">
        <div
          :class="getFileIcon(fileName).color"
          class="tw:flex tw:items-center tw:justify-center tw:shrink-0 tw:w-8 tw:h-8 tw:rounded"
        >
          <QIcon :name="`sym_o_${getFileIcon(fileName).icon}`" class="tw:text-lg" />
        </div>
        <div class="tw:flex tw:flex-col tw:overflow-hidden">
          <span class="tw:text-xs tw:font-medium tw:text-on-sidebar tw:truncate">
            {{ fileName }}
          </span>
          <div class="tw:flex tw:items-center tw:gap-1.5">
            <span class="tw:text-[10px] tw:text-secondary tw:font-medium">
              {{ formatFileSize(fileSize) }}
            </span>
            <span
              v-if="statusBadge"
              :class="statusBadge.class"
              class="tw:text-[8px] tw:uppercase tw:font-bold tw:flex tw:items-center tw:gap-0.5"
            >
              <QIcon :name="statusBadge.icon" class="tw:text-[10px] tw:leading-none" />
              {{ statusBadge.text }}
            </span>
          </div>
        </div>
      </div>
      <WBtn v-if="showDeleteButton" flat dense @click.stop="handleRemove">
        <QIcon :name="deleteIcon" class="tw:text-lg" />
      </WBtn>
    </div>
  </div>
</template>

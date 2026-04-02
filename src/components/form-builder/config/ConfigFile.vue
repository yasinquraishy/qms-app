<script setup>
import { computed } from 'vue'

const field = defineModel('field', {
  type: Object,
  required: true,
})

const fileTypeOptions = [
  { label: 'Asset', value: 'ASSET' },
  { label: 'Company Logo', value: 'COMPANYLOGO' },
  { label: 'User Avatar', value: 'USERAVATAR' },
  { label: 'Editor Image', value: 'EDITORIMAGE' },
  { label: 'Open', value: 'OPEN' },
]

const formattedMaxSize = computed(() => {
  const size = field.value.maxSize
  if (!size || size === 0) {
    return ''
  }

  const kb = 1024
  const mb = kb * 1024
  const gb = mb * 1024

  if (size >= gb) {
    return `${(size / gb).toFixed(2)} GB`
  } else if (size >= mb) {
    return `${(size / mb).toFixed(2)} MB`
  } else if (size >= kb) {
    return `${(size / kb).toFixed(2)} KB`
  } else {
    return `${size} bytes`
  }
})
</script>

<template>
  <div class="tw:mb-4 tw:last:mb-0">
    <div
      class="tw:font-semibold tw:text-xs tw:uppercase tw:tracking-wide tw:text-secondary tw:mb-3 tw:pb-2 tw:border-b tw:border-divider"
    >
      File Settings
    </div>

    <div class="tw:flex tw:flex-col tw:gap-3">
      <WSelect
        v-model="field.fileType"
        :options="fileTypeOptions"
        label="File Type"
        emitValue
        mapOptions
        optionLabel="label"
        optionValue="value"
        hint="Category for uploaded files"
      />
      <WInput
        v-model="field.accept"
        label="Accept (MIME types)"
        placeholder="image/*,video/*,application/pdf,.docx,.doc"
        hint="Comma-separated list of allowed file types"
      />
      <div>
        <WInput
          v-model.number="field.maxSize"
          type="number"
          label="Max File Size (bytes)"
          placeholder="104857600"
          :hint="
            formattedMaxSize
              ? `current: ${formattedMaxSize || 'No limit'}`
              : 'Default: 100 MB (104857600 bytes)'
          "
        />
      </div>
      <QCheckbox v-model="field.multiple" label="Allow multiple files" dense />
    </div>
  </div>
</template>

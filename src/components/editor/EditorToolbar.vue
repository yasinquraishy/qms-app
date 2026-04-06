<script setup>
const props = defineProps({
  editor: {
    type: Object,
    required: true,
  },
  imageUploading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['toggleLink', 'uploadImage'])

const toolbarItems = [
  { icon: 'format_bold', action: 'bold', label: 'Bold' },
  { icon: 'format_italic', action: 'italic', label: 'Italic' },
  { icon: 'format_strikethrough', action: 'strike', label: 'Strikethrough' },
  { divider: true },
  { icon: 'format_list_bulleted', action: 'bulletList', label: 'Bullet List' },
  { icon: 'format_list_numbered', action: 'orderedList', label: 'Numbered List' },
  { divider: true },
  { icon: 'format_quote', action: 'blockquote', label: 'Blockquote' },
  { icon: 'code', action: 'code', label: 'Code' },
  { icon: 'link', action: 'link', label: 'Link', custom: true },
  { divider: true },
  { icon: 'image', action: 'image', label: 'Insert Image', custom: true },
  { divider: true },
  { icon: 'table_chart', action: 'table', label: 'Insert Table', custom: true },
  { divider: true },
  { icon: 'highlight', action: 'highlight', label: 'Highlight' },
]

function executeCommand(item) {
  if (!props.editor) return

  if (item.custom && item.action === 'link') {
    emit('toggleLink')
    return
  }

  if (item.custom && item.action === 'image') {
    openImageFilePicker()
    return
  }

  if (item.custom && item.action === 'table') {
    insertTable()
    return
  }

  const command = `toggle${item.action.charAt(0).toUpperCase() + item.action.slice(1)}`
  props.editor.chain().focus()[command]().run()
}

function insertTable() {
  if (!props.editor) return

  props.editor
    .chain()
    .focus()
    .insertTable({
      rows: 3,
      cols: 3,
      withHeaderRow: true,
    })
    .run()
}

function openImageFilePicker() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e) => {
    const file = e.target.files?.[0]
    if (file) emit('uploadImage', file)
  }
  input.click()
}

function isActive(action) {
  if (!props.editor) return false
  return props.editor.isActive(action)
}
</script>

<template>
  <div
    class="tw:flex tw:items-center tw:gap-1 tw:p-2 tw:bg-sidebar tw:border-b tw:border-divider tw:rounded-t"
  >
    <template v-for="(item, index) in toolbarItems" :key="index">
      <div v-if="item.divider" class="tw:w-px tw:h-5 tw:bg-divider tw:mx-0.5" />
      <WBtn
        v-else
        flat
        dense
        :title="item.label"
        :loading="item.action === 'image' && imageUploading"
        :disable="item.action === 'image' && imageUploading"
        class="tw:min-w-8! tw:min-h-8! tw:rounded! tw:transition-colors!"
        :class="
          isActive(item.action)
            ? 'tw:bg-primary! tw:text-white!'
            : 'tw:text-secondary! tw:hover:bg-background! tw:hover:text-on-background!'
        "
        @click="executeCommand(item)"
      >
        <WIcon :icon="item.icon" size="18px" />
      </WBtn>
    </template>
  </div>
</template>

<style lang="scss" scoped>
/* Force active button styling */
:deep(.q-btn.tw\:bg-primary\!) {
  background-color: var(--q-primary) !important;
  color: white !important;
}
</style>

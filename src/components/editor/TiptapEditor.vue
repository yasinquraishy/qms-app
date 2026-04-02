<script setup>
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { BubbleMenu } from '@tiptap/vue-3/menus'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import EditorToolbar from './EditorToolbar.vue'
import TableToolbar from './TableToolbar.vue'
import LinkDialog from './LinkDialog.vue'
import EditorImageDialog from './EditorImageDialog.vue'
import { uploadFile } from '@/composables/useFileUpload.js'
import { DocumentMention } from './extensions/documentMention/documentMention.js'
import { UserMention } from './extensions/userMention/userMention.js'
import { getCompanyPath } from '@/utils/routeHelpers.js'

const props = defineProps({
  placeholder: {
    type: String,
    default: 'Start typing...',
  },
  editable: {
    type: Boolean,
    default: true,
  },
  contentType: {
    type: String,
    default: 'html', // 'html', 'json', or 'text'
    validator: (value) => ['html', 'json', 'text'].includes(value),
  },
})

const modelValue = defineModel({ type: String, default: '' })

const menuItems = [
  { icon: 'format_bold', action: 'bold', label: 'Bold' },
  { icon: 'format_italic', action: 'italic', label: 'Italic' },
  { icon: 'format_strikethrough', action: 'strike', label: 'Strikethrough' },
  { icon: 'highlight', action: 'highlight', label: 'Highlight' },
  { divider: true },
  { icon: 'code', action: 'code', label: 'Code' },
]

const showLinkInput = ref(false)
const linkUrl = ref('')
const showLinkDialog = ref(false)
const initialLinkUrl = ref('')

const imageUploading = ref(false)
const imageDialog = ref(null)
const router = useRouter()

function openImageDialog(file) {
  imageDialog.value?.open(file)
}

async function handleImageConfirm(file) {
  if (!editor?.value || !file) return

  imageUploading.value = true
  const result = await uploadFile(file, 'ASSET')
  imageUploading.value = false

  if (result.success && result.asset?.url) {
    editor.value.chain().focus().setImage({ src: result.asset.url }).run()
  }
}

const editor = useEditor({
  content: modelValue.value,
  editable: props.editable,
  editorProps: {
    handlePaste(view, event) {
      const items = event.clipboardData?.items
      if (!items) return false

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          event.preventDefault()
          const file = item.getAsFile()
          if (file) openImageDialog(file)
          return true
        }
      }
      return false
    },
    handleClick(view, pos, event) {
      const mentionEl = event.target.closest(
        'a[data-type="documentMention"], a[data-type="userMention"]',
      )
      if (!mentionEl) return false

      event.preventDefault()
      const type = mentionEl.getAttribute('data-type')
      const id = mentionEl.getAttribute('data-id')
      if (!id) return false

      if (type === 'documentMention') {
        router.push(getCompanyPath(`/documents/${id}`))
      } else if (type === 'userMention') {
        router.push(getCompanyPath(`/users/${id}`))
      }
      return true
    },
  },
  extensions: [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3],
      },
      link: false, // We'll use the Link extension separately to customize it
    }),
    Highlight,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'tw:text-primary! tw:underline! tw:cursor-pointer',
      },
    }),
    Placeholder.configure({
      placeholder: props.placeholder,
    }),
    Image.configure({
      HTMLAttributes: {
        class: 'tiptap-image',
      },
    }),
    Table.configure({
      resizable: true,
      HTMLAttributes: {
        class: 'tiptap-table',
      },
    }),
    TableRow,
    TableHeader,
    TableCell,
    DocumentMention,
    UserMention,
  ],
  onUpdate: ({ editor }) => {
    modelValue.value = getContent(editor)
  },
})

function executeCommand(item) {
  if (!editor.value) return

  const command = `toggle${item.action.charAt(0).toUpperCase() + item.action.slice(1)}`
  editor.value.chain().focus()[command]().run()
}

function toggleLinkInput() {
  if (!editor.value) return

  const previousUrl = editor.value.getAttributes('link').href
  linkUrl.value = previousUrl || ''
  showLinkInput.value = !showLinkInput.value

  if (!showLinkInput.value && linkUrl.value) {
    setLink()
  }
}

function openLinkDialog() {
  if (!editor.value) return

  const previousUrl = editor.value.getAttributes('link').href
  initialLinkUrl.value = previousUrl || ''
  showLinkDialog.value = true
}

function setLink() {
  if (!editor.value) return

  if (linkUrl.value === '') {
    editor.value.chain().focus().extendMarkRange('link').unsetLink().run()
  } else {
    let url = linkUrl.value.trim()
    if (url && !url.match(/^https?:\/\//)) {
      url = 'https://' + url
    }
    editor.value.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }
  showLinkInput.value = false
}

function handleLinkSubmit({ url, text }) {
  if (!editor.value) return

  if (url) {
    if (text && editor.value.state.selection.empty) {
      // If there's link text and no selection, insert text with link
      editor.value
        .chain()
        .focus()
        .insertContent({ type: 'text', marks: [{ type: 'link', attrs: { href: url } }], text })
        .run()
    } else {
      // If there's a selection or no text, just apply/update the link
      editor.value.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }
  }
}

function handleLinkRemove() {
  if (!editor.value) return
  editor.value.chain().focus().extendMarkRange('link').unsetLink().run()
}

function handleLinkKeydown(event) {
  if (event.key === 'Enter') {
    event.preventDefault()
    setLink()
  } else if (event.key === 'Escape') {
    event.preventDefault()
    showLinkInput.value = false
  }
}

function getContent(editorInstance) {
  if (!editorInstance) return ''

  switch (props.contentType) {
    case 'json':
      return JSON.stringify(editorInstance.getJSON())
    case 'text':
      return editorInstance.getText()
    case 'html':
    default:
      return editorInstance.getHTML()
  }
}

function setContent(content) {
  if (!editor.value || !content) return

  const currentContent = getContent(editor.value)
  if (currentContent === content) return

  try {
    if (props.contentType === 'json') {
      editor.value.commands.setContent(JSON.parse(content))
    } else {
      editor.value.commands.setContent(content)
    }
  } catch (error) {
    console.error('Error setting editor content:', error)
  }
}

watch(
  () => modelValue.value,
  (newValue) => {
    setContent(newValue)
  },
)

watch(
  () => props.editable,
  (newValue) => {
    if (editor.value) {
      editor.value.setEditable(newValue)
    }
  },
)

onMounted(() => {
  if (modelValue.value) {
    setContent(modelValue.value)
  }
})

onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy()
  }
})

defineExpose({
  editor,
  setContent,
  getContent: () => (editor.value ? getContent(editor.value) : ''),
})
</script>

<template>
  <div class="tiptap-editor-wrapper">
    <!-- Editor Toolbar -->
    <EditorToolbar
      v-if="editor && editable"
      :editor="editor"
      :imageUploading="imageUploading"
      @toggleLink="openLinkDialog"
      @uploadImage="openImageDialog"
    />

    <!-- Image Crop/Resize Dialog -->
    <EditorImageDialog ref="imageDialog" @confirm="handleImageConfirm" />

    <!-- Link Dialog -->
    <LinkDialog
      v-model="showLinkDialog"
      :initialUrl="initialLinkUrl"
      @submit="handleLinkSubmit"
      @remove="handleLinkRemove"
    />

    <!-- Bubble Menu (appears on text selection) -->
    <BubbleMenu v-if="editor && editable" :editor="editor" :tippyOptions="{ duration: 100 }">
      <div
        class="tw:flex tw:items-center tw:gap-1 tw:p-1 tw:bg-white tw:rounded-lg tw:shadow-xl tw:border tw:border-divider"
      >
        <!-- Link Input Mode -->
        <template v-if="showLinkInput">
          <WInput
            v-model="linkUrl"
            dense
            outlined
            placeholder="Enter URL"
            class="tw:min-w-64!"
            autofocus
            @keydown="handleLinkKeydown"
          >
            <template #append>
              <WIcon icon="check" class="tw:cursor-pointer tw:text-positive" @click="setLink" />
            </template>
          </WInput>
          <WBtn
            flat
            dense
            class="tw:min-w-8! tw:min-h-8! tw:rounded!"
            @click="showLinkInput = false"
          >
            <WIcon icon="close" size="18px" />
          </WBtn>
        </template>

        <!-- Normal Menu Items -->
        <template v-else>
          <template v-for="(item, index) in menuItems" :key="index">
            <div v-if="item.divider" class="tw:w-px tw:h-5 tw:bg-divider tw:mx-0.5" />
            <WBtn
              v-else
              flat
              dense
              class="tw:min-w-8! tw:min-h-8! tw:rounded! tw:transition-colors!"
              :class="
                editor.isActive(item.action)
                  ? 'tw:bg-primary! tw:text-white!'
                  : 'tw:text-secondary! tw:hover:bg-sidebar! tw:hover:text-on-sidebar!'
              "
              @click="executeCommand(item)"
            >
              <WIcon :icon="item.icon" size="18px" />
            </WBtn>
          </template>
          <!-- Link Button -->
          <WBtn
            flat
            dense
            class="tw:min-w-8! tw:min-h-8! tw:rounded! tw:transition-colors!"
            :class="
              editor.isActive('link')
                ? 'tw:bg-primary! tw:text-white!'
                : 'tw:text-secondary! tw:hover:bg-sidebar! tw:hover:text-on-sidebar!'
            "
            @click="toggleLinkInput"
          >
            <WIcon icon="link" size="18px" />
          </WBtn>
          <!-- Unlink Button (only show when link is active) -->
          <WBtn
            v-if="editor.isActive('link')"
            flat
            dense
            class="tw:min-w-8! tw:min-h-8! tw:rounded! tw:transition-colors! tw:text-negative! tw:hover:bg-sidebar! tw:hover:text-negative!"
            @click="handleLinkRemove"
          >
            <WIcon icon="link_off" size="18px" />
          </WBtn>
        </template>
      </div>
    </BubbleMenu>

    <!-- Table Toolbar (appears when cursor is in a table) -->
    <BubbleMenu
      v-if="editor && editable"
      :editor="editor"
      :shouldShow="({ editor }) => editor.isActive('table')"
      :tippyOptions="{ duration: 100, placement: 'top' }"
    >
      <TableToolbar :editor="editor" />
    </BubbleMenu>

    <!-- Editor Content -->
    <EditorContent :editor="editor" class="tiptap-editor-content" />
  </div>
</template>

<style lang="scss" scoped>
.tiptap-editor-wrapper {
  border: 1px solid var(--q-divider, #e0e0e0);
  border-radius: 4px;
  background: var(--q-background, #fff);
  min-height: 200px;
  display: flex;
  flex-direction: column;
}

.tiptap-editor-content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

/* Force active button styling */
:deep(.q-btn.tw\:bg-primary\!) {
  background-color: var(--q-primary) !important;
  color: white !important;
}

.tiptap-editor-content :deep(.tiptap-image) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  display: block;
  margin: 0.5rem 0;
}

.tiptap-editor-content :deep(.ProseMirror) {
  outline: none;
  flex-grow: 1;

  > * + * {
    margin-top: 0.75em;
  }

  h1 {
    font-size: 2em;
    font-weight: bold;
    line-height: 1.2;
  }

  h2 {
    font-size: 1.5em;
    font-weight: bold;
    line-height: 1.3;
  }

  h3 {
    font-size: 1.25em;
    font-weight: bold;
    line-height: 1.4;
  }

  ul,
  ol {
    padding-left: 1.5rem;
  }

  ul {
    list-style-type: disc;
  }

  ol {
    list-style-type: decimal;
  }

  blockquote {
    padding-left: 1rem;
    border-left: 3px solid var(--q-divider, #e0e0e0);
    font-style: italic;
  }

  code {
    background: var(--q-background-secondary, #f5f5f5);
    padding: 0.125rem 0.25rem;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
    font-size: 0.9em;
  }

  pre {
    background: var(--q-dark, #1d1d1d);
    color: var(--q-light, #f5f5f5);
    padding: 0.75rem 1rem;
    border-radius: 4px;
    overflow-x: auto;

    code {
      background: none;
      color: inherit;
      padding: 0;
      font-size: inherit;
    }
  }

  mark {
    background: #fef08a;
    padding: 0.125rem 0;
    border-radius: 2px;
  }

  a {
    color: var(--q-primary, #1976d2);
    text-decoration: underline;
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
      color: var(--q-primary-dark, #1565c0);
    }
  }

  hr {
    border: none;
    border-top: 2px solid var(--q-divider, #e0e0e0);
    margin: 2rem 0;
  }

  /* Table Styles */
  table {
    border-collapse: collapse;
    table-layout: fixed;
    width: 100%;
    margin: 1rem 0;
    overflow: hidden;

    td,
    th {
      min-width: 1em;
      border: 1px solid var(--q-divider, #e0e0e0);
      padding: 0.5rem 0.75rem;
      vertical-align: top;
      box-sizing: border-box;
      position: relative;

      > * {
        margin-bottom: 0;
      }
    }

    th {
      font-weight: bold;
      text-align: left;
      background-color: var(--q-background-secondary, #f5f5f5);
    }

    .selectedCell:after {
      z-index: 2;
      position: absolute;
      content: '';
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      background: rgba(200, 200, 255, 0.4);
      pointer-events: none;
    }

    .column-resize-handle {
      position: absolute;
      right: -2px;
      top: 0;
      bottom: -2px;
      width: 4px;
      background-color: var(--q-primary, #1976d2);
      pointer-events: none;
    }
  }

  p.is-editor-empty:first-child::before {
    content: attr(data-placeholder);
    float: left;
    color: var(--q-secondary, #adb5bd);
    pointer-events: none;
    height: 0;
  }

  .mention-chip {
    background: var(--q-main-hover, #f5f5f5);
    padding: 0.125rem 0.5rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    text-decoration: none;
    color: inherit;
    white-space: nowrap;
  }

  .mention-chip:hover {
    opacity: 0.8;
  }
}
</style>

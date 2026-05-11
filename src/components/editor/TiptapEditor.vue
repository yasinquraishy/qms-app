<script setup>
import {
  IconBold,
  IconItalic,
  IconStrikethrough,
  IconHighlight,
  IconCode,
  IconLink,
  IconLinkOff,
  IconX,
  IconCheck,
} from '@tabler/icons-vue'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { BubbleMenu } from '@tiptap/vue-3/menus'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import EditorToolbar from './EditorToolbar.vue'
import TableToolbar from './TableToolbar.vue'
import LinkDialog from './LinkDialog.vue'
import ImageBubbleMenu from './extensions/image/ImageBubbleMenu.vue'
import { AdvancedImage } from './extensions/image/advancedImage.js'
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

const modelValue = defineModel({ type: [String, Object], default: '' })

const menuItems = [
  { icon: IconBold, action: 'bold', label: 'Bold' },
  { icon: IconItalic, action: 'italic', label: 'Italic' },
  { icon: IconStrikethrough, action: 'strike', label: 'Strikethrough' },
  { icon: IconHighlight, action: 'highlight', label: 'Highlight' },
  { divider: true },
  { icon: IconCode, action: 'code', label: 'Code' },
]

const showLinkInput = ref(false)
const linkUrl = ref('')
const showLinkDialog = ref(false)
const initialLinkUrl = ref('')

const imageUploading = ref(false)
const router = useRouter()
const toast = useToast()

// Bridges the AdvancedImage extension's uploader contract to this project's
// upload composable. Tracks an active count for the toolbar spinner — the
// in-document placeholder is rendered separately by the extension itself.
async function uploadImageFile(file) {
  imageUploading.value = true
  try {
    const result = await uploadFile(file, 'ASSET')
    if (!result.success || !result.asset?.url) {
      throw new Error(result.error || 'Upload failed')
    }
    return {
      url: result.asset.url,
      id: result.asset.id ?? null,
      width: result.asset.width ?? null,
      height: result.asset.height ?? null,
    }
  } finally {
    imageUploading.value = false
  }
}

function handleUploadError(err) {
  toast.error(err?.message || 'Image upload failed')
}

// Toolbar entry point — defers to the extension's command so paste/drop and
// toolbar uploads share the same placeholder + replace pipeline.
//
// We snapshot `selection.to` here rather than letting startUpload read it,
// because there's a small window between the file picker closing and this
// handler firing where focus events / DOM blurs could nudge the selection.
// `.to` (not `.from`) is intentional: if the user had a range selected, the
// image goes AFTER it; the selection's content is preserved.
function handleToolbarImageUpload(file) {
  if (!editor.value || !file) return
  const pos = editor.value.state.selection.to
  editor.value.commands.uploadImage(file, pos)
}

// Bubble-menu "Replace" action: open a picker, then swap the current image
// node's attrs (no placeholder needed — the node already exists, we're just
// changing src).
function handleReplaceImage() {
  if (!editor.value) return
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const result = await uploadImageFile(file)
      editor.value
        .chain()
        .focus()
        .updateAttributes('image', {
          src: result.url,
          dataId: result.id,
          originalFilename: file.name,
          width: result.width || null,
          height: result.height || null,
        })
        .run()
    } catch (err) {
      handleUploadError(err)
    }
  }
  input.click()
}

const editor = useEditor({
  content: modelValue.value,
  editable: props.editable,
  editorProps: {
    // Image paste/drop are handled inside AdvancedImage's own ProseMirror
    // plugin — we intentionally don't intercept clipboard images here so the
    // extension owns the full upload/placeholder pipeline.
    handleClick(_view, _pos, event) {
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
    AdvancedImage.configure({
      uploader: uploadImageFile,
      onUploadError: handleUploadError,
      minWidth: 80,
      maxWidth: 1600,
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
    lastLocalEditAt = Date.now()
    modelValue.value = getContent(editor)
  },
})

// Round-trip suppression. When the editor commits a change, the value flows
// out via v-model → parent → syncEngine save → backend → IDB → live-query
// re-emits → parent → v-model → back to us. The "back to us" step lands here
// in the modelValue watcher, and if the backend mutated the HTML at all
// (sanitization, attribute normalization, whitespace), the watcher sees a
// difference and calls setContent — which destroys whatever the user did
// after the edit fired (including newly-inserted images, formatting, etc).
//
// Fix: for SETCONTENT_COOLDOWN_MS after any local edit, ignore parent pushes.
// External changes outside this window (initial load, another user via collab)
// still flow through normally.
let lastLocalEditAt = 0
const SETCONTENT_COOLDOWN_MS = 2500

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

// Text-format bubble menu must hide when a node is selected (image, etc.) or
// the cursor is inside a table — those have their own menus, and stacking
// causes overlap. Default bubble-menu behavior shows for any non-empty
// selection, including NodeSelection, which is why this filter is needed.
function textBubbleShouldShow({ editor, state }) {
  const { selection } = state
  if (selection.empty) return false
  if (selection.node) return false
  if (editor.isActive('image')) return false
  if (editor.isActive('table')) return false
  return true
}

function getContent(editorInstance) {
  if (!editorInstance) return ''

  switch (props.contentType) {
    case 'json':
      return editorInstance.getJSON()
    case 'text':
      return editorInstance.getText()
    case 'html':
    default:
      return editorInstance.getHTML()
  }
}

function setContent(content) {
  if (!editor.value || !content) return

  const rawCurrentContent = getContent(editor.value)
  const currentContent =
    typeof rawCurrentContent === 'string'
      ? rawCurrentContent.trim()
      : JSON.stringify(rawCurrentContent)
  const newContent = typeof content === 'string' ? content.trim() : JSON.stringify(content)

  if (currentContent === newContent) return

  // Loud: if this fires while the user is actively editing, it's the
  // round-trip-strips-content bug. The cooldown guard below should prevent
  // it, but we still want visibility if something gets through.
  console.warn('[TiptapEditor] setContent replacing doc', {
    currentLength: currentContent.length,
    newLength: newContent.length,
    msSinceLocalEdit: Date.now() - lastLocalEditAt,
  })

  try {
    editor.value.commands.setContent(content)
  } catch (error) {
    console.error('Error setting editor content:', error)
  }
}

watch(
  () => modelValue.value,
  (newValue) => {
    // Suppress parent pushes that arrive within the cooldown window after a
    // local edit — they're almost always the save round-trip echoing back a
    // sanitized version of what we just sent. See cooldown comment above.
    if (Date.now() - lastLocalEditAt < SETCONTENT_COOLDOWN_MS) return
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
      @uploadImage="handleToolbarImageUpload"
    />

    <!-- Image bubble menu (appears when an image node is selected) -->
    <ImageBubbleMenu v-if="editor && editable" :editor="editor" @replace="handleReplaceImage" />

    <!-- Link Dialog -->
    <LinkDialog
      v-model="showLinkDialog"
      :initialUrl="initialLinkUrl"
      @submit="handleLinkSubmit"
      @remove="handleLinkRemove"
    />

    <!-- Bubble Menu (appears on text selection) -->
    <BubbleMenu
      v-if="editor && editable"
      pluginKey="text-bubble-menu"
      :editor="editor"
      :shouldShow="textBubbleShouldShow"
      :tippyOptions="{ duration: 100 }"
    >
      <div
        class="tw:flex tw:items-center tw:gap-1 tw:p-1 tw:bg-white tw:rounded-lg tw:shadow-xl tw:border tw:border-divider"
      >
        <!-- Link Input Mode -->
        <template v-if="showLinkInput">
          <div class="tw:relative">
            <BaseTextInput
              v-model="linkUrl"
              placeholder="Enter URL"
              class="tw:min-w-64! tw:pr-8"
              autofocus
              @keydown="handleLinkKeydown"
            />
            <button
              class="tw:absolute tw:right-2 tw:top-1/2 tw:-translate-y-1/2 tw:text-green-600 tw:bg-transparent tw:border-0 tw:cursor-pointer tw:p-0"
              @click="setLink"
            >
              <IconCheck :size="18" />
            </button>
          </div>
          <button
            class="tw:flex tw:items-center tw:justify-center tw:size-8 tw:rounded tw:text-secondary tw:bg-transparent tw:border-0 tw:cursor-pointer tw:hover:bg-sidebar"
            @click="showLinkInput = false"
          >
            <IconX :size="18" />
          </button>
        </template>

        <!-- Normal Menu Items -->
        <template v-else>
          <template v-for="(item, index) in menuItems" :key="index">
            <div v-if="item.divider" class="tw:w-px tw:h-5 tw:bg-divider tw:mx-0.5" />
            <button
              v-else
              class="tw:flex tw:items-center tw:justify-center tw:size-8 tw:rounded tw:transition-colors tw:border-0 tw:cursor-pointer"
              :class="
                editor.isActive(item.action)
                  ? 'tw:bg-primary tw:text-white'
                  : 'tw:text-secondary tw:bg-transparent tw:hover:bg-sidebar tw:hover:text-on-sidebar'
              "
              :title="item.label"
              @click="executeCommand(item)"
            >
              <component :is="item.icon" :size="18" />
            </button>
          </template>
          <!-- Link Button -->
          <button
            class="tw:flex tw:items-center tw:justify-center tw:size-8 tw:rounded tw:transition-colors tw:border-0 tw:cursor-pointer"
            :class="
              editor.isActive('link')
                ? 'tw:bg-primary tw:text-white'
                : 'tw:text-secondary tw:bg-transparent tw:hover:bg-sidebar tw:hover:text-on-sidebar'
            "
            title="Link"
            @click="toggleLinkInput"
          >
            <IconLink :size="18" />
          </button>
          <!-- Unlink Button (only show when link is active) -->
          <button
            v-if="editor.isActive('link')"
            class="tw:flex tw:items-center tw:justify-center tw:size-8 tw:rounded tw:transition-colors tw:border-0 tw:cursor-pointer tw:text-red-500 tw:bg-transparent tw:hover:bg-sidebar"
            title="Remove Link"
            @click="handleLinkRemove"
          >
            <IconLinkOff :size="18" />
          </button>
        </template>
      </div>
    </BubbleMenu>

    <!-- Table Toolbar (appears when cursor is in a table) -->
    <BubbleMenu
      v-if="editor && editable"
      pluginKey="table-bubble-menu"
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

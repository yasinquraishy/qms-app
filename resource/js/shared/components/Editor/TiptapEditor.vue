<script setup>
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import Highlight from '@tiptap/extension-highlight'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { IconInfoCircle } from '@tabler/icons-vue'
import { createTagSuggestion, Tag } from './extensions/tag'
import { Emoji } from './extensions/emoji'
import { processPlainText } from './extensions/processor'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  contentType: { type: String, default: 'text' },
  placeholder: { type: String, default: 'Type here...' },
  readonly: { type: Boolean, default: false },
  tagSuggestionItems: { type: Function, default: undefined },
  tooltip: { type: String, default: '' },
  label: { type: String, default: '' },
  required: { type: Boolean, default: false },
})

const modelValue = defineModel({ type: [String, Object] })

const state = reactive({
  focus: false,
  get active() {
    return this.focus || !!modelValue.value?.length
  },
})

const rootRef = ref()

function tagExtension() {
  const fn = props.tagSuggestionItems
  if (fn) {
    return Tag.configure({
      suggestion: createTagSuggestion({ items: ({ query }) => fn(query) }),
    })
  }
  return Tag
}

const editor = useEditor({
  editable: !props.readonly,
  extensions: [
    StarterKit,
    tagExtension(),
    Highlight,
    Emoji,
    Placeholder.configure({ placeholder: () => props.placeholder }),
  ],
  onFocus() {
    state.focus = true
  },
  onBlur() {
    state.focus = false
  },
  onUpdate() {
    modelValue.value = getContent()
  },
})

function getContent() {
  if (!editor.value) return ''
  if (props.contentType === 'json') return editor.value.getJSON()
  if (props.contentType === 'html') return editor.value.getHTML()
  return editor.value.getText({ blockSeparator: '\n' })
}

function insertContent(type, item) {
  if (!editor.value) return
  editor.value
    .chain()
    .focus()
    .insertContent({ type, attrs: { ...item } })
    .insertContent(' ')
    .run()
}

function insertTag(item) {
  insertContent('tag', item)
}

function insertEmoji(item) {
  insertContent('emoji', item)
}

function setValue(value) {
  if (!editor.value) return
  if (getContent() === value) return
  editor.value.commands.setContent(processPlainText(value), false)
}

function focusEditor() {
  if (state.focus) return
  editor.value?.commands?.focus('end')
}

watch(modelValue, (value) => {
  setValue(value)
})

onMounted(() => {
  setValue(modelValue.value)
  rootRef.value?.addEventListener('click', focusEditor)
})

onUnmounted(() => {
  rootRef.value?.removeEventListener('click', focusEditor)
})

defineExpose({ insertTag, insertEmoji })
</script>

<template>
  <div class="tw:flex tw:flex-col tw:gap-1" v-bind="$attrs">
    <label v-if="label || $slots.label" class="tw:text-sm tw:font-medium tw:text-secondary">
      <slot name="label">{{ label }}</slot>
      <span v-if="required" class="tw:text-red-500">*</span>
    </label>
    <div
      ref="rootRef"
      class="tw:relative tw:flex tw:items-start tw:gap-2 tw:rounded-lg tw:border tw:bg-white tw:px-3 tw:py-2 tw:cursor-text tw:transition-colors tiptap-editor"
      :class="
        state.focus
          ? 'tw:border-primary tw:ring-1 tw:ring-primary/20'
          : 'tw:border-divider tw:hover:border-secondary'
      "
    >
      <EditorContent
        :editor="editor"
        class="tw:flex-1 tw:min-h-20 tw:max-h-50 tw:overflow-y-auto tw:text-sm"
      />
      <button
        v-if="tooltip"
        type="button"
        :title="tooltip"
        class="tw:shrink-0 tw:p-1 tw:rounded tw:text-secondary tw:hover:bg-main-hover tw:hover:text-on-main tw:transition-colors"
        @click.stop
      >
        <IconInfoCircle :size="18" />
      </button>
    </div>
  </div>
</template>

<style>
.tiptap-editor .ProseMirror {
  outline: none;
}

.tiptap-editor .tiptap p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  color: #adb5bd;
  float: left;
  height: 0;
  pointer-events: none;
}
</style>

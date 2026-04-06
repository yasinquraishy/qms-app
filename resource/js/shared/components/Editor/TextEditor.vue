<script setup>
import { onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import Highlight from '@tiptap/extension-highlight'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { QField } from 'quasar'
import { createTagSuggestion, Tag } from './extensions/tag'
import { Emoji } from './extensions/emoji'
import { processPlainText } from './extensions/processor'
import WIcon from '../icon/WIcon'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps({
  contentType: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: 'Type here...',
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  tagSuggestionItems: {
    type: Function,
    default: undefined,
  },
  tooltip: {
    type: String,
    default: '',
  },
})

const modelValue = defineModel({ type: [String, Object] })

const state = reactive({
  targetUid: 'editor-' + Math.random().toString(36).slice(2, 9),
  focus: false,
  get active() {
    return this.focus || !!modelValue.value?.length
  },
})

const editorFieldRef = ref()

function tagExtension() {
  const fn = props.tagSuggestionItems
  if (fn) {
    return Tag.configure({
      suggestion: createTagSuggestion({ items: ({ query }) => fn(query) }),
    })
  } else {
    return Tag
  }
}

const editor = useEditor({
  editable: !props.readonly,
  extensions: [
    StarterKit,
    tagExtension(),
    Highlight,
    Emoji,
    Placeholder.configure({
      placeholder: () => props.placeholder,
    }),
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
  if (!editor.value) {
    return ''
  }
  if (props.contentType === 'json') {
    return editor.value.getJSON()
  } else if (props.contentType === 'html') {
    return editor.value.getHTML()
  } else {
    return editor.value.getText({ blockSeparator: '\n' })
  }
}

function insertContent(type, item) {
  if (!editor.value) return

  editor.value
    .chain()
    .focus()
    .insertContent({
      type,
      attrs: { ...item },
    })
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

  const isSame = getContent() === value
  if (isSame) {
    return
  }
  editor.value.commands.setContent(processPlainText(value), false)
}

function onFocus() {
  if (state.focus) {
    return
  }

  editor.value?.commands?.focus('end')
}

watch(modelValue, (value) => {
  setValue(value)
})

onMounted(() => {
  setValue(modelValue.value)
  editorFieldRef.value?.$el.addEventListener('click', onFocus)
})

onUnmounted(() => {
  editorFieldRef.value?.$el.removeEventListener('click', onFocus)
})

defineExpose({ insertTag, insertEmoji })
</script>

<template>
  <QField
    ref="editorFieldRef"
    :modelValue="modelValue"
    :for="state.targetUid"
    :stackLabel="state.active"
    class="cursor-text editor-field"
    :class="{ 'editor-field-focus': state.active }"
    outlined
    v-bind="$attrs"
  >
    <template #control>
      <EditorContent :id="state.targetUid" :editor="editor" class="full-width editor" />
    </template>

    <template v-if="tooltip" #append>
      <WIcon name="sym_o_info" class="cursor-pointer">
        <QTooltip>{{ tooltip }}</QTooltip>
      </WIcon>
    </template>
  </QField>
</template>

<style lang="scss">
.editor-field {
  .editor {
    margin-block-start: 0.875rem;

    .ProseMirror-focused {
      outline: none;
    }
  }

  .q-field__control {
    block-size: 100% !important;

    .q-field__native {
      overflow: auto;
      align-items: start;
      max-block-size: 100px;
    }
  }

  .q-field__append {
    align-items: end;
    block-size: auto;
  }

  .prompt-icon {
    margin-inline-end: -0.3125rem;
  }
}

.editor-field-focus {
  .tiptap p.is-editor-empty:first-child::before {
    block-size: 0;
    color: #adb5bd;
    content: attr(data-placeholder);
    float: inline-start;
    pointer-events: none;
  }
}
</style>

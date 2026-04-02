import { VueRenderer } from '@tiptap/vue-3'
import tippy from 'tippy.js'
import { PluginKey } from '@tiptap/pm/state'
import EmojiPicker from './EmojiPicker.vue'

export const EmojiPluginKey = new PluginKey('emoji')

export const emojiSuggestion = {
  pluginKey: EmojiPluginKey,

  char: ':',

  render: () => {
    let component
    let popup

    return {
      onStart: (props) => {
        component = new VueRenderer(EmojiPicker, {
          props,
          editor: props.editor,
        })

        if (!props.clientRect) return

        popup = tippy(document.body, {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        })
      },

      onUpdate(props) {
        component.updateProps(props)

        if (!props.clientRect) return

        popup.setProps({
          getReferenceClientRect: props.clientRect,
        })
      },

      onKeyDown(props) {
        if (props.event.key === 'Escape') {
          popup.hide()
          return true
        }

        return false
      },

      onExit() {
        if (popup) popup.destroy()
        if (component) component.destroy()
      },
    }
  },
}

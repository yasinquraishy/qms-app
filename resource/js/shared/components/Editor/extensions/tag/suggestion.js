import { VueRenderer } from '@tiptap/vue-3'
import { PluginKey } from '@tiptap/pm/state'
import tippy from 'tippy.js'
import TagList from './TagList.vue'

export const TagPluginKey = new PluginKey('tag')

export const tagSuggestion = {
  pluginKey: TagPluginKey,

  char: '%',

  render: () => {
    let component
    let popup

    return {
      onStart: (props) => {
        component = new VueRenderer(TagList, {
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

        return component.ref?.onKeyDown(props)
      },

      onExit() {
        if (popup) popup.destroy()
        if (component) component.destroy()
      },
    }
  },
}

export function createTagSuggestion(options) {
  return { ...tagSuggestion, ...options, pluginKey: TagPluginKey }
}

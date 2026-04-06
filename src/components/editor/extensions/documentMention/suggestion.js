import { VueRenderer } from '@tiptap/vue-3'
import { PluginKey } from '@tiptap/pm/state'
import tippy from 'tippy.js'
import { get } from '@/api'
import { currentSession } from '@/utils/currentSession'
import MentionList from '../MentionList.vue'

export const DocumentMentionPluginKey = new PluginKey('documentMention')

export const documentSuggestion = {
  pluginKey: DocumentMentionPluginKey,
  char: '#',

  async items({ query }) {
    if (!query) return []
    const data = await get('/v1/services/documents', {
      params: { search: query, companyId: currentSession.value?.companyId },
    })
    return (data?.documents ?? []).slice(0, 10).map((doc) => ({
      id: doc.id,
      label: `<span class="tw:text-on-main/50">#${doc.docNumber}</span> - ${doc.title}`,
    }))
  },

  render: () => {
    let component
    let popup

    return {
      onStart(props) {
        component = new VueRenderer(MentionList, {
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

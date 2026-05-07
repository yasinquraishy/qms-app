import { VueRenderer } from '@tiptap/vue-3'
import { PluginKey } from '@tiptap/pm/state'
import tippy from 'tippy.js'
import { db } from '@models/index'
import DocumentMentionList from './DocumentMentionList.vue'

export const DocumentMentionPluginKey = new PluginKey('documentMention')

export const documentSuggestion = {
  pluginKey: DocumentMentionPluginKey,
  char: '#',

  async items({ query }) {
    if (!query) return []
    const q = query.toLowerCase()
    const [allDocs, effectiveVersions] = await Promise.all([
      db.Document.where().exec(),
      db.DocumentVersion.where().where('statusId', 'EFFECTIVE').exec(),
    ])
    const effectiveDocIds = new Set(effectiveVersions.map((v) => v.documentId))
    return allDocs
      .filter((doc) => effectiveDocIds.has(doc.id))
      .filter(
        (doc) => doc.title?.toLowerCase().includes(q) || doc.docNumber?.toLowerCase().includes(q),
      )
      .slice(0, 10)
  },

  render: () => {
    let component
    let popup

    return {
      onStart(props) {
        component = new VueRenderer(DocumentMentionList, {
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

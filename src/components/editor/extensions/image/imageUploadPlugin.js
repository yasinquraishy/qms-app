import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export const uploadKey = new PluginKey('imageUpload')

// Decoration-based placeholder. Why: a decoration survives concurrent edits
// without occupying a real document position (it doesn't change the schema),
// so the user can keep typing while an upload is in flight, and the placeholder
// position is auto-mapped through every subsequent transaction.
export function imageUploadPlugin() {
  return new Plugin({
    key: uploadKey,
    state: {
      init() {
        return DecorationSet.empty
      },
      apply(tr, set) {
        set = set.map(tr.mapping, tr.doc)
        const action = tr.getMeta(uploadKey)
        if (!action) return set
        if (action.add) {
          const dom = document.createElement('span')
          dom.className = 'tiptap-image-placeholder'
          dom.setAttribute('contenteditable', 'false')
          dom.setAttribute('data-upload-id', action.add.id)
          dom.innerHTML =
            '<span class="tiptap-image-placeholder__spinner" aria-hidden="true"></span>' +
            '<span class="tiptap-image-placeholder__label">Uploading image…</span>'
          const deco = Decoration.widget(action.add.pos, dom, {
            id: action.add.id,
            side: -1,
            ignoreSelection: true,
          })
          return set.add(tr.doc, [deco])
        }
        if (action.remove) {
          const matches = set.find(undefined, undefined, (spec) => spec.id === action.remove.id)
          return matches.length ? set.remove(matches) : set
        }
        return set
      },
    },
    props: {
      decorations(state) {
        return this.getState(state)
      },
    },
  })
}

export function findUploadPlaceholderPos(state, id) {
  const set = uploadKey.getState(state)
  if (!set) return null
  const matches = set.find(undefined, undefined, (spec) => spec.id === id)
  return matches.length ? matches[0].from : null
}

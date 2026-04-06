import Mention from '@tiptap/extension-mention'
import { mergeAttributes } from '@tiptap/vue-3'
import { documentSuggestion } from './suggestion.js'

export const DocumentMention = Mention.extend({
  name: 'documentMention',

  addAttributes() {
    return {
      id: { default: null, parseHTML: (el) => el.getAttribute('data-id') },
      label: { default: null, parseHTML: (el) => el.getAttribute('data-label') },
    }
  },

  parseHTML() {
    return [{ tag: 'a[data-type="documentMention"]' }]
  },

  renderHTML({ node, HTMLAttributes }) {
    const label = node.attrs.label ?? node.attrs.id
    return [
      'a',
      mergeAttributes(
        {
          'data-type': 'documentMention',
          'data-id': node.attrs.id,
          'data-label': label,
          class: 'mention-chip mention-document',
        },
        HTMLAttributes,
      ),
      `#${label}`,
    ]
  },

  renderText({ node }) {
    return `#${node.attrs.label ?? node.attrs.id}`
  },
}).configure({
  suggestion: documentSuggestion,
})

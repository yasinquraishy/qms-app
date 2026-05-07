import Mention from '@tiptap/extension-mention'
import { mergeAttributes } from '@tiptap/vue-3'
import { documentSuggestion } from './suggestion.js'

export const DocumentMention = Mention.extend({
  name: 'documentMention',

  addAttributes() {
    return {
      id: { default: null, parseHTML: (el) => el.getAttribute('data-id') },
      docNumber: {
        default: null,
        parseHTML: (el) => el.getAttribute('data-doc-number'),
      },
      title: { default: null, parseHTML: (el) => el.getAttribute('data-title') },
    }
  },

  parseHTML() {
    return [{ tag: 'a[data-type="documentMention"]' }]
  },

  renderHTML({ node, HTMLAttributes }) {
    const docNumber = node.attrs.docNumber ?? ''
    const title = node.attrs.title ?? ''
    return [
      'a',
      mergeAttributes(
        {
          'data-type': 'documentMention',
          'data-id': node.attrs.id,
          'data-doc-number': docNumber,
          'data-title': title,
          class: 'mention-chip mention-document',
        },
        HTMLAttributes,
      ),
      ['span', { class: 'tw:text-on-main/50' }, `#${docNumber}`],
      ` - ${title}`,
    ]
  },

  renderText({ node }) {
    const docNumber = node.attrs.docNumber ?? node.attrs.id ?? ''
    const title = node.attrs.title ?? ''
    return `#${docNumber} - ${title}`
  },
}).configure({
  suggestion: documentSuggestion,
})

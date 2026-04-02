import Mention from '@tiptap/extension-mention'
import { mergeAttributes } from '@tiptap/vue-3'
import { userSuggestion } from './suggestion.js'

export const UserMention = Mention.extend({
  name: 'userMention',

  addAttributes() {
    return {
      id: { default: null, parseHTML: (el) => el.getAttribute('data-id') },
      label: { default: null, parseHTML: (el) => el.getAttribute('data-label') },
    }
  },

  parseHTML() {
    return [{ tag: 'a[data-type="userMention"]' }]
  },

  renderHTML({ node, HTMLAttributes }) {
    const label = node.attrs.label ?? node.attrs.id
    return [
      'a',
      mergeAttributes(
        {
          'data-type': 'userMention',
          'data-id': node.attrs.id,
          'data-label': label,
          class: 'mention-chip mention-user',
        },
        HTMLAttributes,
      ),
      `@${label}`,
    ]
  },

  renderText({ node }) {
    return `@${node.attrs.label ?? node.attrs.id}`
  },
}).configure({
  suggestion: userSuggestion,
})

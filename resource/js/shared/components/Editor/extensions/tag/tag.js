import Mention from '@tiptap/extension-mention'
import { mergeAttributes } from '@tiptap/vue-3'
import { tagSuggestion } from './suggestion'

const tagOptions = {
  HTMLAttributes: {
    class: 'highlight',
  },

  suggestion: tagSuggestion,

  renderText({ node, options }) {
    return `${options.suggestion.char}${node.attrs.id ?? node.attrs.label}${options.suggestion.char}`
  },

  renderHTML({ options, node }) {
    const attrs = mergeAttributes(this.HTMLAttributes, options.HTMLAttributes)
    let label = node.attrs.label ?? node.attrs.id

    if (options.suggestion.items && !node.attrs.label) {
      const query = node.attrs.id ?? node.attrs.label
      const items = options.suggestion.items({ editor: {}, query })
      const found = Array.isArray(items) ? items.find((item) => item.id === query) : undefined
      if (found) {
        attrs['data-id'] = found.id
        attrs['data-label'] = found.label
        label = found.label ?? found.id
      }
    }

    return ['span', attrs, label]
  },
}

export const Tag = Mention.extend({
  name: 'tag',
}).configure(tagOptions)

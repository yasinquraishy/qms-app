import Mention from '@tiptap/extension-mention'
import { mergeAttributes } from '@tiptap/vue-3'
import { emojiSuggestion } from './suggestion'

const emojiOptions = {
  suggestion: emojiSuggestion,

  renderText({ node }) {
    return node.attrs.label
  },

  renderHTML({ options, node }) {
    const attrs = mergeAttributes(this.HTMLAttributes, options.HTMLAttributes)

    return ['span', attrs, node.attrs.label]
  },
}

export const Emoji = Mention.extend({
  name: 'emoji',
}).configure(emojiOptions)

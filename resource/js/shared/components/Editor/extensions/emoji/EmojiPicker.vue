<script setup>
import { ref } from 'vue'
import EmojiPicker from 'vue3-emoji-picker'
import 'vue3-emoji-picker/css'

const props = defineProps({
  command: {
    type: Function,
    required: true,
  },
})

const emojiPickerRef = ref()

function onSelectEmoji(emoji) {
  props.command({
    label: emoji.i,
    id: null,
  })
}
</script>

<template>
  <EmojiPicker ref="emojiPickerRef" :native="true" @select="onSelectEmoji" />
</template>

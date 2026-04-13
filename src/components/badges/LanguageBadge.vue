<script setup>
defineProps({
  languageId: {
    type: String,
    default: null,
  },
})

const LANGUAGE_MAP = {
  'en-US': 'English (US)',
  'en-GB': 'English (UK)',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  zh: 'Chinese',
  ja: 'Japanese',
}
</script>

<template>
  <BaseBadge v-bind="$attrs">{{ LANGUAGE_MAP[languageId] || languageId || '—' }}</BaseBadge>
</template>

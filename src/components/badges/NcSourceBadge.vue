<script setup>
defineProps({
  source: {
    type: Object,
    required: true,
  },
})

const SCHEME_MAP = {
  INCOMING_INSPECTION: { class: 'tw:bg-blue-100 tw:text-blue-700' },
  IN_PROCESS: { class: 'tw:bg-indigo-100 tw:text-indigo-700' },
  FINAL_INSPECTION: { class: 'tw:bg-violet-100 tw:text-violet-700' },
  AUDIT: { class: 'tw:bg-purple-100 tw:text-purple-700' },
  CUSTOMER_COMPLAINT: { class: 'tw:bg-red-100 tw:text-red-700' },
  INTERNAL_OBSERVATION: { class: 'tw:bg-sky-100 tw:text-sky-700' },
}

const scheme = (id) => SCHEME_MAP[id] || { class: 'tw:bg-gray-100 tw:text-gray-600' }
</script>

<template>
  <BaseBadge v-bind="$attrs" :class="scheme(source.id).class">
    {{ source.name || source.id || '—' }}
  </BaseBadge>
</template>

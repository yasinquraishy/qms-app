<script setup>
defineProps({
  dispositionType: {
    type: Object,
    required: true,
  },
})

const SCHEME_MAP = {
  RETURN_TO_SUPPLIER: { class: 'tw:bg-purple-100 tw:text-purple-700' },
  REWORK: { class: 'tw:bg-amber-100 tw:text-amber-700' },
  SCRAP: { class: 'tw:bg-red-100 tw:text-red-700' },
  ACCEPT_USE_AS_IS: { class: 'tw:bg-green-100 tw:text-green-700' },
  REGRADE: { class: 'tw:bg-blue-100 tw:text-blue-700' },
  QUARANTINE_PENDING_REVIEW: { class: 'tw:bg-orange-100 tw:text-orange-700' },
}

const scheme = (id) => SCHEME_MAP[id] || { class: 'tw:bg-gray-100 tw:text-gray-600' }
</script>

<template>
  <BaseBadge v-bind="$attrs" :class="scheme(dispositionType.id).class">
    {{ dispositionType.name || dispositionType.id || '—' }}
  </BaseBadge>
</template>

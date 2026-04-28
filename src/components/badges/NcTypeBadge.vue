<script setup>
defineProps({
  type: {
    type: Object,
    required: true,
  },
})

const SCHEME_MAP = {
  PRODUCT: { class: 'tw:bg-orange-100 tw:text-orange-700' },
  PROCESS: { class: 'tw:bg-amber-100 tw:text-amber-700' },
  SUPPLIER: { class: 'tw:bg-yellow-100 tw:text-yellow-700' },
  SYSTEM: { class: 'tw:bg-teal-100 tw:text-teal-700' },
  CUSTOMER_RETURN: { class: 'tw:bg-rose-100 tw:text-rose-700' },
  AUDIT_FINDING: { class: 'tw:bg-purple-100 tw:text-purple-700' },
  OTHER: { class: 'tw:bg-gray-100 tw:text-gray-600' },
}

const scheme = (id) => SCHEME_MAP[id] || { class: 'tw:bg-gray-100 tw:text-gray-600' }
</script>

<template>
  <BaseBadge v-bind="$attrs" :class="scheme(type.id).class">
    {{ type.name || type.id || '—' }}
  </BaseBadge>
</template>

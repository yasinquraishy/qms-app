<script setup>
defineProps({
  riskLevelId: {
    type: String,
    default: null,
  },
})

const RISK_LEVEL_MAP = {
  Low: { label: 'Low', class: 'tw:bg-emerald-100 tw:text-emerald-700' },
  Medium: { label: 'Medium', class: 'tw:bg-amber-100 tw:text-amber-700' },
  High: { label: 'High', class: 'tw:bg-red-100 tw:text-red-700' },
}
</script>

<template>
  <BaseBadge
    v-if="riskLevelId && RISK_LEVEL_MAP[riskLevelId]"
    v-bind="$attrs"
    :class="RISK_LEVEL_MAP[riskLevelId].class"
    showDot
  >
    {{ RISK_LEVEL_MAP[riskLevelId].label }}
  </BaseBadge>
  <BaseBadge v-else v-bind="$attrs">{{ riskLevelId || '—' }}</BaseBadge>
</template>

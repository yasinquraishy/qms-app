<script setup>
import { AUDIT_FIELD_LABELS } from '@/utils/auditFieldLabels.js'

const props = defineProps({
  entityType: { type: String, default: null },
  oldValueJson: { type: Object, default: null },
  newValueJson: { type: Object, default: null },
})

const diffRows = computed(() => {
  const old = props.oldValueJson || {}
  const neu = props.newValueJson || {}
  const labels = AUDIT_FIELD_LABELS[props.entityType] || {}

  const rows = []
  const allKeys = new Set([...Object.keys(old), ...Object.keys(neu)])

  for (const field of allKeys) {
    if (field.startsWith('__')) continue

    const oldVal = old[field]
    const newVal = neu[field]

    if (oldVal === newVal) continue

    rows.push({
      field,
      label: labels[field] || field,
      oldValue: oldVal,
      newValue: newVal,
    })
  }

  return rows
})

function formatValue(val) {
  if (val === null || val === undefined) return '—'
  if (typeof val === 'boolean') return val ? 'Yes' : 'No'
  if (typeof val === 'object') return JSON.stringify(val)
  return String(val)
}
</script>

<template>
  <div class="tw:space-y-1">
    <template v-if="diffRows.length > 0">
      <div
        v-for="row in diffRows"
        :key="row.field"
        class="tw:flex tw:items-start tw:gap-3 tw:py-1.5 tw:px-3 tw:bg-main tw:rounded tw:border tw:border-divider tw:text-sm"
      >
        <span class="tw:w-36 tw:shrink-0 tw:font-medium tw:text-secondary tw:text-xs tw:pt-0.5">
          {{ row.label }}
        </span>
        <div class="tw:flex tw:items-center tw:gap-2 tw:flex-wrap">
          <span
            v-if="row.oldValue !== undefined"
            class="tw:px-1.5 tw:py-0.5 tw:rounded tw:bg-red-50 tw:text-red-700 tw:text-xs tw:line-through tw:border tw:border-red-200"
          >
            {{ formatValue(row.oldValue) }}
          </span>
          <span v-if="row.oldValue !== undefined" class="tw:text-secondary tw:text-xs">→</span>
          <span
            v-if="row.newValue !== undefined"
            class="tw:px-1.5 tw:py-0.5 tw:rounded tw:bg-green-50 tw:text-green-700 tw:text-xs tw:border tw:border-green-200"
          >
            {{ formatValue(row.newValue) }}
          </span>
        </div>
      </div>
    </template>
    <div v-else class="tw:text-secondary tw:text-sm tw:italic tw:px-3">
      No field changes recorded.
    </div>
  </div>
</template>

<script setup>
import { extractDiffRows, generateAuditSummary } from '@/utils/auditValueFormatter.js'
import { singular } from 'pluralize'

const props = defineProps({
  log: { type: Object, required: true },
  resolvedEntity: { type: Object, default: null },
})

// Extract diff rows synchronously — value resolution happens inside AuditValueCell.
const diffRows = computed(() =>
  extractDiffRows(
    singular(props.log.entityType ?? ''),
    props.log.oldValueJson,
    props.log.newValueJson,
  ),
)

const summary = computed(() =>
  generateAuditSummary(props.log, props.resolvedEntity, diffRows.value),
)

const action = computed(() => props.log.action)

// CREATE → show only new values; DELETE → show only old values; UPDATE → show both.
const isCreate = computed(() => action.value === 'CREATE')
const isDelete = computed(() => action.value === 'DELETE')
</script>

<template>
  <div class="tw:space-y-2">
    <!-- Summary sentence -->
    <p class="tw:text-sm tw:text-primary">
      {{ summary.prefix }}
      <span v-if="summary.entityLabel" class="tw:font-semibold"> {{ summary.entityLabel }}</span>
      <span v-if="summary.singleField" class="tw:text-secondary tw:ml-1">
        <span class="tw:mx-1">:</span>
        <AuditValueCell
          :value="summary.singleField.oldVal"
          :fieldMeta="summary.singleField.meta"
          variant="old"
        />
        <span class="tw:mx-1 tw:text-secondary">→</span>
        <AuditValueCell
          :value="summary.singleField.newVal"
          :fieldMeta="summary.singleField.meta"
          variant="new"
        />
      </span>
    </p>

    <!-- Field diff rows (hidden when it's a child-bubbled entry or only 1 field already shown inline) -->
    <template v-if="!resolvedEntity?.isChild && diffRows.length > 1">
      <div
        v-for="row in diffRows"
        :key="row.field"
        class="tw:flex tw:items-start tw:gap-3 tw:py-1.5 tw:px-3 tw:bg-main tw:rounded tw:border tw:border-divider tw:text-sm"
      >
        <span class="tw:w-36 tw:shrink-0 tw:font-medium tw:text-secondary tw:text-xs tw:pt-0.5">
          {{ row.meta?.label || row.field }}
        </span>
        <div class="tw:flex tw:items-center tw:gap-2 tw:flex-wrap">
          <!-- CREATE: just the new value (no arrow, no old) -->
          <template v-if="isCreate">
            <AuditValueCell :value="row.newVal" :fieldMeta="row.meta" variant="new" />
          </template>
          <!-- DELETE: just the old value (strikethrough) -->
          <template v-else-if="isDelete">
            <AuditValueCell :value="row.oldVal" :fieldMeta="row.meta" variant="old" />
          </template>
          <!-- UPDATE: old → new -->
          <template v-else>
            <AuditValueCell
              v-if="row.oldVal !== undefined"
              :value="row.oldVal"
              :fieldMeta="row.meta"
              variant="old"
            />
            <span
              v-if="row.oldVal !== undefined && row.newVal !== undefined"
              class="tw:text-secondary tw:text-xs"
              >→</span
            >
            <AuditValueCell
              v-if="row.newVal !== undefined"
              :value="row.newVal"
              :fieldMeta="row.meta"
              variant="new"
            />
          </template>
        </div>
      </div>
    </template>

    <!-- Empty state: only show when there genuinely are no diff rows and it's not a child event -->
    <div
      v-if="
        !resolvedEntity?.isChild &&
        diffRows.length === 0 &&
        log.oldValueJson == null &&
        log.newValueJson == null
      "
      class="tw:text-secondary tw:text-sm tw:italic tw:px-3"
    >
      No field changes recorded.
    </div>
  </div>
</template>

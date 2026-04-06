<script setup>
import { useTaskInstances } from '@/composables/useTaskInstances.js'
import { getCompanyPath } from '@/utils/routeHelpers'
import { DateTime } from 'luxon'

const { taskInstances, loading } = useTaskInstances()

const columns = [
  { name: 'title', label: 'DOCUMENT', field: 'title', align: 'left' },
  { name: 'type', label: 'TYPE', field: 'type', align: 'left' },
  { name: 'dueDate', label: 'DUE DATE', field: 'dueDate', align: 'left' },
  { name: 'status', label: 'STATUS', field: 'status', align: 'left' },
]

function isDuePast(dueDate) {
  if (!dueDate) return false
  return dueDate < DateTime.now()
}
</script>

<template>
  <QCard flat bordered class="tw:flex tw:flex-col tw:overflow-hidden">
    <WTable
      :rows="taskInstances"
      :columns="columns"
      :loading="loading"
      hideTop
      noBorder
      class="tw:flex-1"
    >
      <!-- Document Title -->
      <template #body-cell-title="slotProps">
        <QTd :props="slotProps" class="tw:cursor-pointer">
          <RouterLink
            class="tw:flex tw:flex-col tw:group"
            :to="getCompanyPath(`task-instances/${slotProps.row.id}`)"
          >
            <span class="tw:text-sm tw:font-semibold tw:text-on-main tw:group-hover:text-primary">
              {{ slotProps.row.document?.title || '—' }}
            </span>
            <span class="tw:text-[10px] tw:text-secondary tw:font-mono tw:tracking-tight">
              {{ slotProps.row.document?.docNumber || '—' }}
            </span>
          </RouterLink>
        </QTd>
      </template>

      <!-- Type -->
      <template #body-cell-type="slotProps">
        <QTd :props="slotProps">
          <span class="tw:text-sm tw:text-secondary">
            {{ slotProps.row.document?.documentType?.name || '—' }}
          </span>
        </QTd>
      </template>

      <!-- Due Date -->
      <template #body-cell-dueDate="slotProps">
        <QTd :props="slotProps">
          <span
            class="tw:text-sm tw:font-medium"
            :class="isDuePast(slotProps.row.dueDate) ? 'tw:text-red-500' : 'tw:text-on-main'"
          >
            {{ slotProps.row.dueDate ? slotProps.row.dueDate.formatDate('date') : '—' }}
          </span>
        </QTd>
      </template>

      <!-- Status -->
      <template #body-cell-status="slotProps">
        <QTd :props="slotProps">
          <WStatusBadge :status="slotProps.row.statusId" variant="task" />
        </QTd>
      </template>
    </WTable>
  </QCard>
</template>

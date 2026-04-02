<script setup>
import { useApprovalWorkflowInstances } from '@/composables/useApprovalWorkflowInstances.js'
import { getCompanyPath } from '@/utils/routeHelpers'

import { DateTime } from 'luxon'

const { instances, loading } = useApprovalWorkflowInstances()

const columns = [
  { name: 'title', label: 'ITEM TITLE', field: 'title', align: 'left' },
  { name: 'module', label: 'MODULE', field: 'module', align: 'left' },
  { name: 'type', label: 'TYPE', field: 'type', align: 'left' },
  { name: 'submittedBy', label: 'SUBMITTED BY', field: 'submittedBy', align: 'left' },
  { name: 'currentStep', label: 'CURRENT STEP', field: 'currentStep', align: 'left' },
  { name: 'dueDate', label: 'DUE DATE', field: 'dueDate', align: 'left' },
  { name: 'status', label: 'STATUS', field: 'status', align: 'left' },
]

function getActiveStep(instance) {
  return instance.steps?.find((s) => s.statusId === 'IN_PROGRESS') || null
}

function getSubmitterInitials(instance) {
  const user = instance.resource?.user
  if (!user) return '?'
  return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
}

function getSubmitterName(instance) {
  const user = instance.resource?.user
  if (!user) return 'Unknown'
  return `${user.firstName || ''} ${user.lastName || ''}`.trim()
}

function isDuePast(dueDate) {
  if (!dueDate) return false
  return dueDate < DateTime.now()
}

function getStatus(instance) {
  return instance.statusId || 'Unknown'
}
</script>

<template>
  <QCard flat bordered class="tw:flex tw:flex-col tw:overflow-hidden">
    <WTable
      :rows="instances"
      :columns="columns"
      :loading="loading"
      hideTop
      noBorder
      class="tw:flex-1"
    >
      <!-- Item Title -->
      <template #body-cell-title="slotProps">
        <QTd :props="slotProps" class="tw:cursor-pointer">
          <RouterLink
            class="tw:flex tw:flex-col tw:group"
            :to="getCompanyPath(`workflow-instances/${slotProps.row.id}`)"
          >
            <span class="tw:text-sm tw:font-semibold tw:text-on-main tw:group-hover:text-primary">
              {{ slotProps.row.resource?.title || '—' }}
            </span>
            <span class="tw:text-[10px] tw:text-secondary tw:font-mono tw:tracking-tight">
              {{ slotProps.row.resource?.docNumber || slotProps.row.id.slice(0, 8) }}
            </span>
          </RouterLink>
        </QTd>
      </template>

      <!-- Module -->
      <template #body-cell-module="slotProps">
        <QTd :props="slotProps">
          <span class="tw:text-sm tw:text-on-main">
            {{ slotProps.row.workflowVersion?.workflow?.module?.name || '—' }}
          </span>
        </QTd>
      </template>

      <!-- Type -->
      <template #body-cell-type="slotProps">
        <QTd :props="slotProps">
          <span class="tw:text-sm tw:text-secondary">
            {{ slotProps.row.resource?.documentType?.name || '—' }}
          </span>
        </QTd>
      </template>

      <!-- Submitted By -->
      <template #body-cell-submittedBy="slotProps">
        <QTd :props="slotProps">
          <div class="tw:flex tw:items-center tw:gap-2">
            <div
              class="tw:size-6 tw:rounded-full tw:bg-slate-200 tw:flex tw:items-center tw:justify-center tw:text-[10px] tw:font-bold tw:shrink-0"
            >
              {{ getSubmitterInitials(slotProps.row) }}
            </div>
            <span class="tw:text-sm">{{ getSubmitterName(slotProps.row) }}</span>
          </div>
        </QTd>
      </template>

      <!-- Current Step -->
      <template #body-cell-currentStep="slotProps">
        <QTd :props="slotProps">
          <span class="tw:text-sm tw:text-secondary">
            {{ getActiveStep(slotProps.row)?.step?.name || '—' }}
          </span>
        </QTd>
      </template>

      <!-- Due Date -->
      <template #body-cell-dueDate="slotProps">
        <QTd :props="slotProps">
          <span
            class="tw:text-sm tw:font-medium"
            :class="
              isDuePast(slotProps.row.resource?.dueDate) ? 'tw:text-red-500' : 'tw:text-on-main'
            "
          >
            {{
              slotProps.row.resource?.dueDate
                ? slotProps.row.resource.dueDate.formatDate('date')
                : '—'
            }}
          </span>
        </QTd>
      </template>

      <!-- Status -->
      <template #body-cell-status="slotProps">
        <QTd :props="slotProps">
          <WStatusBadge :status="getStatus(slotProps.row)" variant="workflow" showDot />
        </QTd>
      </template>
    </WTable>
  </QCard>
</template>

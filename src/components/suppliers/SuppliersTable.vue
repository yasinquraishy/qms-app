<script setup>
import { getCompanyPath } from '@/utils/routeHelpers'

defineProps({
  rows: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  canUpdate: {
    type: Boolean,
    default: false,
  },
  canDelete: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['delete', 'edit'])

const columns = [
  { name: 'name', label: 'SUPPLIER NAME', field: 'name', align: 'left', sortable: true },
  { name: 'code', label: 'CODE', field: 'code', align: 'left', sortable: true },
  { name: 'category', label: 'CATEGORY', field: 'category', align: 'left', sortable: true },
  { name: 'riskLevel', label: 'RISK LEVEL', field: 'riskLevel', align: 'left', sortable: true },
  { name: 'status', label: 'STATUS', field: 'statusId', align: 'left', sortable: true },
  {
    name: 'lastEvaluation',
    label: 'LAST EVALUATION',
    field: 'lastEvaluationDate',
    align: 'left',
    sortable: true,
  },
  { name: 'actions', label: 'ACTIONS', field: 'actions', align: 'right' },
]

function getInitials(name) {
  if (!name) return '??'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

const riskLevelConfig = {
  Low: { bg: 'tw:bg-emerald-50', text: 'tw:text-emerald-600', border: 'tw:border-emerald-100' },
  Medium: { bg: 'tw:bg-orange-50', text: 'tw:text-orange-600', border: 'tw:border-orange-100' },
  High: { bg: 'tw:bg-red-50', text: 'tw:text-red-600', border: 'tw:border-red-100' },
}

const statusConfig = {
  APPROVED: { bg: 'tw:bg-blue-50', text: 'tw:text-blue-600', border: 'tw:border-blue-100' },
  PENDING: { bg: 'tw:bg-amber-50', text: 'tw:text-amber-600', border: 'tw:border-amber-100' },
  REJECTED: { bg: 'tw:bg-red-50', text: 'tw:text-red-600', border: 'tw:border-red-100' },
  BLOCKED: { bg: 'tw:bg-slate-100', text: 'tw:text-slate-500', border: 'tw:border-slate-200' },
}

function getRiskClasses(level) {
  return riskLevelConfig[level] || riskLevelConfig.Low
}

function getStatusClasses(statusId) {
  return statusConfig[statusId] || statusConfig.PENDING
}

function confirmDelete(row) {
  emit('delete', row)
}

function onEdit(row) {
  emit('edit', row)
}
</script>

<template>
  <WCard>
    <WTable :rows="rows" :columns="columns" :loading="loading" class="tw:flex-1" hideTop noBorder>
      <!-- Name Column -->
      <template #body-cell-name="props">
        <QTd :props="props">
          <RouterLink
            class="tw:flex tw:items-center tw:gap-3"
            :to="getCompanyPath(`/suppliers/${props.row.id}`)"
          >
            <div
              class="tw:w-8 tw:h-8 tw:rounded-full tw:bg-primary-container tw:flex tw:items-center tw:justify-center tw:text-primary tw:font-bold tw:text-xs"
            >
              {{ getInitials(props.row.name) }}
            </div>
            <div class="tw:font-bold tw:text-on-main">{{ props.row.name }}</div>
          </RouterLink>
        </QTd>
      </template>

      <!-- Code Column -->
      <template #body-cell-code="props">
        <QTd :props="props">
          <QBadge color="primary" outline label>{{ props.row.code }}</QBadge>
        </QTd>
      </template>

      <!-- Category Column -->
      <template #body-cell-category="props">
        <QTd :props="props">
          <span class="tw:text-sm tw:text-secondary">{{ props.row.category || '-' }}</span>
        </QTd>
      </template>

      <!-- Risk Level Column -->
      <template #body-cell-riskLevel="props">
        <QTd :props="props">
          <span
            v-if="props.row.riskLevel"
            class="tw:inline-flex tw:items-center tw:px-2 tw:py-1 tw:rounded-md tw:text-[11px] tw:font-bold tw:uppercase tw:tracking-tight tw:border"
            :class="[
              getRiskClasses(props.row.riskLevel).bg,
              getRiskClasses(props.row.riskLevel).text,
              getRiskClasses(props.row.riskLevel).border,
            ]"
          >
            {{ props.row.riskLevel }}
          </span>
          <span v-else class="tw:text-sm tw:text-secondary">-</span>
        </QTd>
      </template>

      <!-- Status Column -->
      <template #body-cell-status="props">
        <QTd :props="props">
          <span
            class="tw:inline-flex tw:items-center tw:px-2 tw:py-1 tw:rounded-md tw:text-[11px] tw:font-bold tw:uppercase tw:tracking-tight tw:border"
            :class="[
              getStatusClasses(props.row.statusId).bg,
              getStatusClasses(props.row.statusId).text,
              getStatusClasses(props.row.statusId).border,
            ]"
          >
            {{ props.row.status?.name || props.row.statusId }}
          </span>
        </QTd>
      </template>

      <!-- Last Evaluation Column -->
      <template #body-cell-lastEvaluation="props">
        <QTd :props="props">
          <span class="tw:text-sm tw:text-secondary">
            {{
              props.row.lastEvaluationDate ? props.row.lastEvaluationDate.formatDate('date') : '-'
            }}
          </span>
        </QTd>
      </template>

      <!-- Actions Column -->
      <template #body-cell-actions="props">
        <QTd :props="props">
          <div v-if="canUpdate || canDelete" class="tw:flex tw:justify-end">
            <WBtn flat round dense color="grey-6" icon="more_vert">
              <QMenu>
                <QList dense style="min-width: 140px">
                  <QItem v-if="canUpdate" v-close-popup clickable @click="onEdit(props.row)">
                    <QItemSection>
                      <div class="tw:flex tw:items-center tw:gap-2">
                        <WIcon name="edit" size="20px" color="primary" />
                        <div>Edit</div>
                      </div>
                    </QItemSection>
                  </QItem>

                  <QItem
                    v-if="canDelete"
                    v-close-popup
                    clickable
                    class="tw:text-bad"
                    @click="confirmDelete(props.row)"
                  >
                    <QItemSection>
                      <div class="tw:flex tw:items-center tw:gap-2">
                        <WIcon name="delete" size="20px" />
                        <div>Delete</div>
                      </div>
                    </QItemSection>
                  </QItem>
                </QList>
              </QMenu>
            </WBtn>
          </div>
        </QTd>
      </template>
    </WTable>
  </WCard>
</template>

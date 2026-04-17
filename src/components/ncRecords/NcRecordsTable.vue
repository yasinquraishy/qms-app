<script setup>
import { IconEdit, IconTrash, IconClock } from '@tabler/icons-vue'

const props = defineProps({
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
  { name: 'ncNumber', label: 'NC NUMBER', field: 'ncNumber', align: 'left', sortable: true },
  { name: 'title', label: 'TITLE', field: 'title', align: 'left', sortable: true },
  { name: 'status', label: 'STATUS', field: 'statusId', align: 'left', sortable: true },
  { name: 'severity', label: 'SEVERITY', field: 'severityId', align: 'left', sortable: true },
  { name: 'type', label: 'TYPE', field: 'ncTypeId', align: 'left', sortable: true },
  { name: 'dueDate', label: 'DUE DATE', field: 'dueDate', align: 'left', sortable: true },
  { name: 'actions', label: '', field: 'actions', align: 'right' },
]

function onEdit(row) {
  emit('edit', row)
}

function confirmDelete(row) {
  emit('delete', row)
}

function rowMenuItems(row) {
  const items = []
  if (props.canUpdate) {
    items.push({ name: 'Edit', icon: IconEdit, click: () => onEdit(row) })
  }
  if (props.canDelete) {
    items.push({ name: 'Delete', icon: IconTrash, click: () => confirmDelete(row) })
  }
  return items
}
</script>

<template>
  <BaseTable :rows="rows" :columns="columns" :loading="loading" rowKey="id">
    <template #body-cell-ncNumber="{ row }">
      <span
        class="tw:inline-flex tw:items-center tw:rounded tw:border tw:border-primary tw:px-2 tw:py-0.5 tw:text-xs tw:font-medium tw:text-primary"
      >
        {{ row.ncNumber }}
      </span>
    </template>

    <template #body-cell-title="{ row }">
      <div class="tw:flex tw:flex-col tw:gap-0.5">
        <span class="tw:font-semibold tw:text-on-main">{{ row.title }}</span>
        <span v-if="row.description" class="tw:text-xs tw:text-secondary tw:line-clamp-1">
          {{ row.description }}
        </span>
      </div>
    </template>

    <template #body-cell-status="{ row }">
      <NcStatusBadgeById v-if="row.statusId" :statusId="row.statusId" />
    </template>

    <template #body-cell-severity="{ row }">
      <NcSeverityBadgeById v-if="row.severityId" :severityId="row.severityId" />
    </template>

    <template #body-cell-type="{ row }">
      <NcTypeBadgeById v-if="row.ncTypeId" :typeId="row.ncTypeId" />
    </template>

    <template #body-cell-dueDate="{ row }">
      <div
        v-if="row.dueDate"
        :class="[
          'tw:flex tw:items-center tw:gap-1 tw:text-xs',
          row.isOverdue ? 'tw:text-red tw:font-medium' : 'tw:text-secondary',
        ]"
      >
        <IconClock v-if="row.isOverdue" class="tw:size-3.5" />
        {{ row.dueDate.formatDate() }}
      </div>
      <span v-else class="tw:text-secondary">—</span>
    </template>

    <template #body-cell-actions="{ row }">
      <div v-if="canUpdate || canDelete" class="tw:flex tw:justify-end">
        <BaseMenu :items="rowMenuItems(row)" />
      </div>
    </template>
  </BaseTable>
</template>

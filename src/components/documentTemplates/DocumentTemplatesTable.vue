<script setup>
import {
  IconCircleCheck,
  IconCircleX,
  IconEye,
  IconArchive,
  IconArchiveOff,
} from '@tabler/icons-vue'

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
  canArchive: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['view', 'archive', 'unarchive'])

const columns = [
  { name: 'name', label: 'NAME', field: 'name', align: 'left', sortable: true },
  { name: 'status', label: 'STATUS', field: 'statusId', align: 'left', sortable: true },
  { name: 'prefix', label: 'PREFIX', field: 'prefix', align: 'left', sortable: true },
  { name: 'department', label: 'DEPARTMENT', field: 'department', align: 'left', sortable: true },
  {
    name: 'training',
    label: 'TRAINING',
    field: 'trainingAvailable',
    align: 'center',
    sortable: true,
  },
  { name: 'sections', label: 'SECTIONS', field: 'sections', align: 'center' },
  {
    name: 'reviewPeriod',
    label: 'REVIEW PERIOD',
    field: 'periodicReviewMonths',
    align: 'center',
    sortable: true,
  },
  { name: 'created', label: 'CREATED', field: 'createdAt', align: 'left', sortable: true },
  { name: 'actions', label: '', field: 'actions', align: 'right' },
]

function getSectionCount(row) {
  return row.sections?.length || 0
}

function rowMenuItems(row) {
  const items = []
  items.push({ name: 'View Details', icon: IconEye, click: () => emit('view', row) })
  if (props.canArchive) {
    if (row.statusId !== 'ARCHIVED') {
      items.push({ name: 'Archive', icon: IconArchive, click: () => emit('archive', row) })
    } else {
      items.push({ name: 'Unarchive', icon: IconArchiveOff, click: () => emit('unarchive', row) })
    }
  }
  return items
}
</script>

<template>
  <BaseTable :rows="rows" :columns="columns" :loading="loading" rowKey="id">
    <template #body-cell-name="{ row }">
      <div
        class="tw:font-bold tw:text-on-main tw:cursor-pointer tw:hover:text-primary"
        @click="emit('view', row)"
      >
        {{ row.name }}
      </div>
    </template>

    <template #body-cell-status="{ row }">
      <DocumentTemplateStatusBadgeById :statusId="row.statusId" />
    </template>

    <template #body-cell-prefix="{ row }">
      <span
        class="tw:inline-flex tw:items-center tw:rounded tw:border tw:border-primary tw:px-2 tw:py-0.5 tw:text-xs tw:font-medium tw:text-primary"
      >
        {{ row.prefix }}
      </span>
    </template>

    <template #body-cell-department="{ row }">
      <DepartmentBadgeById v-if="row.departmentId" :departmentId="row.departmentId" />
      <span v-else class="tw:text-sm tw:text-secondary">—</span>
    </template>

    <template #body-cell-training="{ row }">
      <div class="tw:flex tw:justify-center">
        <IconCircleCheck v-if="row.trainingAvailable" :size="20" class="tw:text-green-600" />
        <IconCircleX v-else :size="20" class="tw:text-gray-400" />
      </div>
    </template>

    <template #body-cell-sections="{ row }">
      <div class="tw:flex tw:justify-center">
        <span
          class="tw:inline-flex tw:items-center tw:rounded tw:bg-gray-100 tw:px-3 tw:py-0.5 tw:text-xs tw:font-medium tw:text-gray-600"
        >
          {{ getSectionCount(row) }}
        </span>
      </div>
    </template>

    <template #body-cell-reviewPeriod="{ row }">
      <div class="tw:text-center tw:text-sm tw:text-secondary">
        {{ row.periodicReviewMonths }} months
      </div>
    </template>

    <template #body-cell-created="{ row }">
      <span class="tw:text-sm tw:text-secondary">{{ row.createdAt?.formatDate('date') }}</span>
    </template>

    <template #body-cell-actions="{ row }">
      <div v-if="canArchive" class="tw:flex tw:justify-end">
        <BaseMenu :items="rowMenuItems(row)" />
      </div>
    </template>
  </BaseTable>
</template>

<script setup>
import { getCompanyPath } from '@/utils/routeHelpers'
import { IconEdit, IconTrash } from '@tabler/icons-vue'

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

const router = useRouter()

const columns = [
  { name: 'name', label: 'NAME', field: 'name', align: 'left', sortable: true },
  {
    name: 'description',
    label: 'DESCRIPTION',
    field: 'description',
    align: 'left',
    sortable: false,
  },
  {
    name: 'optionsCount',
    label: 'OPTIONS',
    field: 'optionsCount',
    align: 'center',
    sortable: false,
  },
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

function onRowClick(row) {
  router.push(getCompanyPath(`/option-sets/${row.id}`))
}
</script>

<template>
  <BaseTable :rows="rows" :columns="columns" :loading="loading" rowKey="id" @rowClick="onRowClick">
    <template #body-cell-name="{ row }">
      <div class="tw:font-bold tw:text-on-main">{{ row.name }}</div>
    </template>

    <template #body-cell-description="{ row }">
      <span class="tw:text-sm tw:text-secondary tw:line-clamp-2">{{ row.description || '—' }}</span>
    </template>

    <template #body-cell-optionsCount="{ row }">
      <BaseBadge> {{ row.options?.length || 0 }} </BaseBadge>
    </template>

    <template #body-cell-actions="{ row }">
      <div v-if="canUpdate || canDelete" class="tw:flex tw:justify-end">
        <BaseMenu :items="rowMenuItems(row)" />
      </div>
    </template>
  </BaseTable>
</template>

<script setup>
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

const columns = [
  { name: 'name', label: 'NAME', field: 'name', align: 'left', sortable: true },
  { name: 'sku', label: 'SKU', field: 'sku', align: 'left', sortable: true },
  { name: 'family', label: 'FAMILY', field: 'family', align: 'left', sortable: true },
  { name: 'productType', label: 'PRODUCT TYPE', field: 'productTypeId', align: 'left', sortable: false },
  { name: 'status', label: 'STATUS', field: 'statusId', align: 'left', sortable: false },
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
    <template #body-cell-name="{ row }">
      <div class="tw:font-bold tw:text-on-main">{{ row.name }}</div>
    </template>

    <template #body-cell-sku="{ row }">
      <span
        class="tw:inline-flex tw:items-center tw:rounded tw:border tw:border-primary tw:px-2 tw:py-0.5 tw:text-xs tw:font-medium tw:text-primary"
      >{{ row.sku }}</span>
    </template>

    <template #body-cell-family="{ row }">
      <span class="tw:text-sm tw:text-secondary">{{ row.family || '—' }}</span>
    </template>

    <template #body-cell-productType="{ row }">
      <ProductTypeBadgeById v-if="row.productTypeId" :productTypeId="row.productTypeId" />
      <span v-else class="tw:text-sm tw:text-secondary">—</span>
    </template>

    <template #body-cell-status="{ row }">
      <ProductStatusBadgeById v-if="row.statusId" :statusId="row.statusId" />
      <span v-else class="tw:text-sm tw:text-secondary">—</span>
    </template>

    <template #body-cell-actions="{ row }">
      <div v-if="canUpdate || canDelete" class="tw:flex tw:justify-end">
        <BaseMenu :items="rowMenuItems(row)" />
      </div>
    </template>
  </BaseTable>
</template>

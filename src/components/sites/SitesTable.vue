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
  { name: 'name', label: 'SITE NAME', field: 'name', align: 'left', sortable: true },
  { name: 'code', label: 'CODE', field: 'code', align: 'left', sortable: true },
  { name: 'address', label: 'ADDRESS', field: 'address', align: 'left', sortable: true },
  { name: 'timezone', label: 'TIMEZONE', field: 'timezone', align: 'left', sortable: true },
  { name: 'actions', label: 'ACTIONS', field: 'actions', align: 'right' },
]

function onEdit(row) {
  emit('edit', row)
}

function onDelete(row) {
  emit('delete', row)
}

function rowMenuItems(row) {
  const items = []
  if (props.canUpdate) {
    items.push({ name: 'Edit', icon: IconEdit, click: () => onEdit(row) })
  }
  if (props.canDelete) {
    items.push({ name: 'Delete', icon: IconTrash, click: () => onDelete(row) })
  }
  return items
}
</script>

<template>
  <BaseCard>
    <BaseTable :rows="rows" :columns="columns" :loading="loading" rowKey="id" hidePagination>
      <!-- Name Column -->
      <template #body-cell-name="{ row }">
        <div class="tw:font-bold tw:text-on-main">{{ row.name }}</div>
      </template>

      <!-- Code Column -->
      <template #body-cell-code="{ row }">
        <BaseBadge>{{ row.code }}</BaseBadge>
      </template>

      <!-- Address Column -->
      <template #body-cell-address="{ row }">
        <span class="tw:text-sm tw:text-secondary">{{ row.address || '-' }}</span>
      </template>

      <!-- Timezone Column -->
      <template #body-cell-timezone="{ row }">
        <span class="tw:text-xs tw:text-secondary">{{ row.timezone }}</span>
      </template>

      <!-- Actions Column -->
      <template #body-cell-actions="{ row }">
        <div v-if="props.canUpdate || props.canDelete" class="tw:flex tw:justify-end">
          <BaseMenu :items="rowMenuItems(row)" />
        </div>
      </template>
    </BaseTable>
  </BaseCard>
</template>

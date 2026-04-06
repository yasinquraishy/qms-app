<script setup>
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
  { name: 'name', label: 'SITE NAME', field: 'name', align: 'left', sortable: true },
  { name: 'code', label: 'CODE', field: 'code', align: 'left', sortable: true },
  { name: 'address', label: 'ADDRESS', field: 'address', align: 'left', sortable: true },
  { name: 'timezone', label: 'TIMEZONE', field: 'timezone', align: 'left', sortable: true },
  { name: 'actions', label: 'ACTIONS', field: 'actions', align: 'right' },
]

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
          <div class="tw:font-bold tw:text-on-main">{{ props.row.name }}</div>
        </QTd>
      </template>

      <!-- Code Column -->
      <template #body-cell-code="props">
        <QTd :props="props">
          <QBadge color="primary" outline label>{{ props.row.code }}</QBadge>
        </QTd>
      </template>

      <!-- Address Column -->
      <template #body-cell-address="props">
        <QTd :props="props">
          <span class="tw:text-sm tw:text-secondary">{{ props.row.address || '-' }}</span>
        </QTd>
      </template>

      <!-- Timezone Column -->
      <template #body-cell-timezone="props">
        <QTd :props="props">
          <span class="tw:text-xs tw:text-secondary">{{ props.row.timezone }}</span>
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

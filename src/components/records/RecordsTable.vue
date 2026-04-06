<script setup>
import { useRecords } from '@/composables/useRecords.js'

defineProps({
  rows: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const { updateRecord } = useRecords()

const previewDialog = ref(false)
const selectedRecordId = ref(null)

function openPreview(_, row) {
  selectedRecordId.value = row.id
  previewDialog.value = true
}

function closePreview() {
  previewDialog.value = false
  selectedRecordId.value = null
}

async function handleUpdate(recordId, updates) {
  const result = await updateRecord(recordId, updates)
  if (result.error) {
    console.error('Failed to update record:', result.error)
  }
}

const columns = [
  {
    name: 'recordNumber',
    label: 'RECORD #',
    field: 'recordNumber',
    align: 'left',
    sortable: true,
  },
  {
    name: 'template',
    label: 'TEMPLATE',
    field: (row) => row.template?.title,
    align: 'left',
    sortable: true,
  },
  {
    name: 'documentTypeId',
    label: 'DOCUMENT TYPE',
    field: 'documentTypeId',
    align: 'left',
    sortable: true,
  },
  { name: 'statusId', label: 'STATUS', field: 'statusId', align: 'left', sortable: true },
  {
    name: 'createdBy',
    label: 'CREATED BY',
    field: (row) => {
      if (!row.user) return '—'
      return `${row.user.firstName} ${row.user.lastName}`
    },
    align: 'left',
    sortable: true,
  },
  { name: 'createdAt', label: 'CREATED', field: 'createdAt', align: 'left', sortable: true },
  { name: 'actions', label: 'ACTIONS', field: 'actions', align: 'right' },
]
</script>

<template>
  <QCard class="tw:flex tw:flex-col tw:h-full" flat bordered>
    <WTable
      :rows="rows"
      :columns="columns"
      :loading="loading"
      class="tw:flex-1"
      hideTop
      noBorder
      @rowClick="openPreview"
    >
      <!-- Record Number Column -->
      <template #body-cell-recordNumber="scope">
        <QTd :props="scope">
          <span class="tw:font-bold">{{ scope.row.recordNumber }}</span>
        </QTd>
      </template>

      <!-- Document Type Column -->
      <template #body-cell-documentTypeId="scope">
        <QTd :props="scope">
          <DocumentTypeBadgeById :documentTypeId="scope.row.documentTypeId" />
        </QTd>
      </template>

      <!-- Status Column -->
      <template #body-cell-statusId="scope">
        <QTd :props="scope">
          <WStatusBadge :status="scope.row.statusId" variant="record" showIcon />
        </QTd>
      </template>

      <!-- Created At Column -->
      <template #body-cell-createdAt="scope">
        <QTd :props="scope">
          <span class="tw:text-sm tw:text-secondary">{{
            scope.row.createdAt.formatDate('date')
          }}</span>
        </QTd>
      </template>

      <!-- Actions Column -->
      <template #body-cell-actions="scope">
        <QTd :props="scope">
          <div class="tw:flex tw:justify-end">
            <QBtn icon="more_vert" flat dense round color="grey-7" @click.prevent.stop>
              <QMenu>
                <QList style="min-width: 150px">
                  <QItem
                    v-if="scope.row.statusId === 'DRAFT'"
                    clickable
                    @click="handleUpdate(scope.row.id, { statusId: 'APPROVED' })"
                  >
                    <QItemSection avatar>
                      <QIcon name="check_circle" color="positive" />
                    </QItemSection>
                    <QItemSection>Approve</QItemSection>
                  </QItem>

                  <QItem
                    v-if="scope.row.statusId === 'APPROVED'"
                    clickable
                    @click="handleUpdate(scope.row.id, { statusId: 'DRAFT' })"
                  >
                    <QItemSection avatar>
                      <QIcon name="undo" color="warning" />
                    </QItemSection>
                    <QItemSection>Unapprove</QItemSection>
                  </QItem>
                </QList>
              </QMenu>
            </QBtn>
          </div>
        </QTd>
      </template>
    </WTable>

    <!-- Preview Dialog -->
    <QDialog
      v-model="previewDialog"
      maximized
      transitionShow="slide-up"
      transitionHide="slide-down"
    >
      <RecordPreview v-if="selectedRecordId" :recordId="selectedRecordId" @close="closePreview" />
    </QDialog>
  </QCard>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { useRecords } from '@/composables/useRecords.js'
import { isAllowed } from '@/utils/currentSession.js'

const { records, loading, filters, deleteRecord, fetchRecords, createRecord } = useRecords()
const $q = useQuasar()

const showAddDialog = ref(false)

const canCreateRecord = computed(() => isAllowed(['records:create']))

onMounted(() => {
  fetchRecords()
})

async function onDeleteRecord(row) {
  $q.dialog({
    title: 'Confirm Deletion',
    message: `Are you sure you want to delete record "${row.recordNumber}"? This action cannot be undone.`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const result = await deleteRecord(row.id)
    if (result.error) {
      $q.notify({
        type: 'negative',
        message: result.error,
      })
    } else {
      $q.notify({
        type: 'positive',
        message: 'Record deleted successfully',
      })
    }
  })
}

function onRecordCreated() {
  showAddDialog.value = false
  $q.notify({
    type: 'positive',
    message: 'Record created successfully',
  })
}
</script>

<template>
  <div class="tw:flex tw:flex-col tw:gap-3 tw:h-full tw:p-5">
    <SafeTeleport to="#main-header-title">
      <div class="tw:flex tw:items-center tw:gap-2 tw:text-on-sidebar">
        <WIcon icon="folder_open" class="tw:text-primary" size="24px" />
        <h2 class="tw:text-lg tw:font-bold tw:tracking-tight tw:text-nowrap">Records</h2>
      </div>
    </SafeTeleport>

    <!-- Page Header -->
    <div class="tw:flex tw:items-center tw:justify-between">
      <div class="tw:flex tw:flex-col tw:gap-1">
        <div class="tw:text-3xl tw:font-bold tw:text-on-sidebar">Records</div>
        <div class="tw:text-sm tw:text-secondary">View and manage submitted records.</div>
      </div>
      <WBtn
        v-if="canCreateRecord"
        color="primary"
        icon="add"
        label="Add Record"
        unelevated
        @click="showAddDialog = true"
      />
    </div>

    <RecordsFilterToolbar v-model:filters="filters" />

    <div>
      <RecordsTable :rows="records" :loading="loading" @delete="onDeleteRecord" />
    </div>

    <!-- Add Record Dialog -->
    <QDialog
      v-model="showAddDialog"
      maximized
      transitionShow="slide-up"
      transitionHide="slide-down"
    >
      <AddRecordDialog
        :createRecord="createRecord"
        @created="onRecordCreated"
        @close="showAddDialog = false"
      />
    </QDialog>
  </div>
</template>

<style scoped lang="scss">
.text-slate-800 {
  color: #1e293b;
}
</style>

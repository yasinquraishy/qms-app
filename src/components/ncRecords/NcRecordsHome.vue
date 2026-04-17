<script setup>
import { IconAlertTriangle } from '@tabler/icons-vue'
import { isAllowed } from '@/utils/currentSession.js'
import { currentCompany } from '@/utils/currentCompany'

const showDialog = ref(false)
const selectedNcId = ref(null)

const confirmDelete = ref({ open: false, record: null })

const canCreateNc = computed(() => isAllowed(['nc_records:create']))
const canUpdateNc = computed(() => isAllowed(['nc_records:update']))
const canDeleteNc = computed(() => isAllowed(['nc_records:delete']))

const filters = ref({ search: '', statusId: null, severityId: null, siteId: null })

const records = useLiveQueryWithDeps(
  [
    () => filters.value.search,
    () => filters.value.statusId,
    () => filters.value.severityId,
    () => filters.value.siteId,
  ],
  async (db, [search, statusId, severityId, siteId]) => {
    let results
    if (statusId) {
      results = await db.NcRecord.where('[companyId+statusId]', [
        currentCompany.value?.id,
        statusId,
      ]).exec()
    } else {
      results = await db.NcRecord.where().exec()
    }

    if (severityId) {
      results = results.filter((r) => r.severityId === severityId)
    }
    if (siteId) {
      results = results.filter((r) => r.siteId === siteId)
    }
    if (search) {
      const q = search.toLowerCase()
      results = results.filter(
        (r) =>
          r.title?.toLowerCase().includes(q) ||
          r.ncNumber?.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q),
      )
    }

    return results.sort(
      (a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0),
    )
  },
  { initial: [] },
)

function openDialog(id = null) {
  selectedNcId.value = id
  showDialog.value = true
}

function onEditRecord(row) {
  openDialog(row.id)
}

function onDeleteRecord(row) {
  confirmDelete.value = { open: true, record: row }
}

async function confirmDeleteRecord() {
  await confirmDelete.value.record.delete()
  confirmDelete.value = { open: false, record: null }
}
</script>

<template>
  <div class="tw:flex tw:flex-col tw:gap-3 tw:h-full tw:p-5">
    <SafeTeleport to="#main-header-title">
      <div class="tw:flex tw:items-center tw:gap-2 tw:text-on-sidebar">
        <IconAlertTriangle class="tw:text-primary" :size="24" />
        <h2 class="tw:text-lg tw:font-bold tw:tracking-tight tw:text-nowrap">Non-Conformances</h2>
      </div>
    </SafeTeleport>

    <SafeTeleport to="#main-header-actions">
      <BaseButton v-if="canCreateNc" @click="openDialog()">
        <span>Create NC</span>
      </BaseButton>
    </SafeTeleport>

    <!-- Page Header -->
    <div class="tw:flex tw:items-center tw:justify-between">
      <div class="tw:flex tw:flex-col tw:gap-1">
        <div class="tw:text-3xl tw:font-bold tw:text-on-sidebar">Non-Conformances</div>
        <div class="tw:text-sm tw:text-secondary">
          Track, investigate, and resolve quality non-conformances.
        </div>
      </div>
    </div>

    <NcRecordsFilterToolbar v-model:filters="filters" />

    <NcRecordsTable
      :rows="records"
      :canUpdate="canUpdateNc"
      :canDelete="canDeleteNc"
      @delete="onDeleteRecord"
      @edit="onEditRecord"
    />
  </div>

  <NcRecordCreateUpdateDialog v-if="showDialog" :id="selectedNcId" v-model="showDialog" />

  <ConfirmDialog
    v-model="confirmDelete.open"
    title="Delete Non-Conformance"
    :message="`Are you sure you want to delete NC '${confirmDelete.record?.ncNumber}'? This cannot be undone.`"
    okLabel="Delete"
    @ok="confirmDeleteRecord"
  />
</template>

<script setup>
import { useQuasar } from 'quasar'
import { useSites } from '@/composables/useSites.js'
import { isAllowed } from '@/utils/currentSession.js'

const showDialog = ref(false)
const selectedSiteId = ref(null)

const { sites, loading, filters, deleteSite, fetchSites } = useSites()
const $q = useQuasar()

const canCreateSite = computed(() => isAllowed(['sites:create']))
const canUpdateSite = computed(() => isAllowed(['sites:update']))
const canDeleteSite = computed(() => isAllowed(['sites:delete']))

function openDialog(id = null) {
  selectedSiteId.value = id
  showDialog.value = true
}

onMounted(() => {
  fetchSites()
})

async function onDeleteSite(row) {
  $q.dialog({
    title: 'Confirm Deletion',
    message: `Are you sure you want to delete site "${row.name}" (${row.code})? This action cannot be undone.`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const result = await deleteSite(row.id)
    if (result.error) {
      $q.notify({
        type: 'negative',
        message: result.error,
      })
    } else {
      $q.notify({
        type: 'positive',
        message: 'Site deleted successfully',
      })
    }
  })
}

function onEditSite(row) {
  openDialog(row.id)
}
</script>

<template>
  <div class="tw:flex tw:flex-col tw:gap-3 tw:h-full tw:p-5">
    <SafeTeleport to="#main-header-title">
      <div class="tw:flex tw:items-center tw:gap-2 tw:text-on-sidebar">
        <WIcon icon="location_on" class="tw:text-primary" size="24px" />
        <h2 class="tw:text-lg tw:font-bold tw:tracking-tight tw:text-nowrap">Sites</h2>
      </div>
    </SafeTeleport>

    <SafeTeleport to="#main-header-actions">
      <WBtn
        v-if="canCreateSite"
        label="Create New Site"
        icon="add"
        color="primary"
        unelevated
        class="tw:font-medium"
        @click="openDialog()"
      />
    </SafeTeleport>

    <!-- Page Header -->
    <div class="tw:flex tw:items-center tw:justify-between">
      <div class="tw:flex tw:flex-col tw:gap-1">
        <div class="tw:text-3xl tw:font-bold tw:text-on-sidebar">Sites</div>
        <div class="tw:text-sm tw:text-secondary">
          Manage your organization's physical locations and sites.
        </div>
      </div>
    </div>

    <SitesFilterToolbar v-model:filters="filters" />

    <SitesTable
      :rows="sites"
      :loading="loading"
      :canUpdate="canUpdateSite"
      :canDelete="canDeleteSite"
      @delete="onDeleteSite"
      @edit="onEditSite"
    />
  </div>

  <!-- Create/Edit Site Dialog -->
  <SitesCreateUpdateDialog v-if="showDialog" :id="selectedSiteId" v-model="showDialog" />
</template>

<style scoped lang="scss">
.text-slate-800 {
  color: #1e293b;
}
</style>

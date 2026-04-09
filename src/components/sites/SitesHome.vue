<script setup>
import { IconPlus, IconMapPin } from '@tabler/icons-vue'
import { useQuasar } from 'quasar'
import { useSites } from '@/composables/useSites.js'
import { isAllowed } from '@/utils/currentSession.js'

const showDialog = ref(false)
const selectedSiteId = ref(null)
const showDeleteConfirm = ref(false)
const siteToDelete = ref(null)
const filters = ref({ search: '' })

const { sites, deleteSite } = useSites()
const $q = useQuasar()

const canCreateSite = computed(() => isAllowed(['sites:create']))
const canUpdateSite = computed(() => isAllowed(['sites:update']))
const canDeleteSite = computed(() => isAllowed(['sites:delete']))

function openDialog(id = null) {
  selectedSiteId.value = id
  showDialog.value = true
}

function onDeleteSite(row) {
  siteToDelete.value = row
  showDeleteConfirm.value = true
}

async function confirmDelete() {
  try {
    await deleteSite({ id: siteToDelete.value.id })
    $q.notify({
      type: 'positive',
      message: 'Site deleted successfully',
    })
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err.message || 'Failed to delete site',
    })
  }
  showDeleteConfirm.value = false
  siteToDelete.value = null
}

function onEditSite(row) {
  openDialog(row.id)
}
</script>

<template>
  <div class="tw:flex tw:flex-col tw:gap-3 tw:h-full tw:p-5">
    <SafeTeleport to="#main-header-title">
      <div class="tw:flex tw:items-center tw:gap-2 tw:text-on-sidebar">
        <IconMapPin class="tw:text-primary tw:w-6 tw:h-6" />
        <h2 class="tw:text-lg tw:font-bold tw:tracking-tight tw:text-nowrap">Sites</h2>
      </div>
    </SafeTeleport>

    <SafeTeleport to="#main-header-actions">
      <BaseButton
        v-if="canCreateSite"
        color="primary"
        unelevated
        class="tw:font-medium"
        @click="openDialog()"
      >
        <IconPlus /> Create New Site
      </BaseButton>
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
      :loading="false"
      :canUpdate="canUpdateSite"
      :canDelete="canDeleteSite"
      @delete="onDeleteSite"
      @edit="onEditSite"
    />

    <!-- Create/Edit Site Dialog -->
    <SitesCreateUpdateDialog v-if="showDialog" :id="selectedSiteId" v-model="showDialog" />

    <!-- Delete Confirmation -->
    <ConfirmDialog
      v-model="showDeleteConfirm"
      title="Delete Site"
      :message="`Are you sure you want to delete site '${siteToDelete?.name}' (${siteToDelete?.code})? This action cannot be undone.`"
      @confirm="confirmDelete"
    />
  </div>
</template>

<style scoped lang="scss">
.text-slate-800 {
  color: #1e293b;
}
</style>

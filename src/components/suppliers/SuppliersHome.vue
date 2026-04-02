<script setup>
import { useQuasar } from 'quasar'
import { useSuppliers } from '@/composables/useSuppliers.js'
import { isAllowed } from '@/utils/currentSession.js'
import { getCompanyPath } from '@/utils/routeHelpers.js'

const router = useRouter()

const { suppliers, loading, filters, deleteSupplier, fetchSuppliers } = useSuppliers()
const $q = useQuasar()

const canCreateSupplier = computed(() => isAllowed(['suppliers:create']))
const canUpdateSupplier = computed(() => isAllowed(['suppliers:update']))
const canDeleteSupplier = computed(() => isAllowed(['suppliers:delete']))

onMounted(() => {
  fetchSuppliers()
})

function onCreateSupplier() {
  router.push(getCompanyPath('/suppliers/create'))
}

function onEditSupplier(row) {
  router.push(getCompanyPath(`/suppliers/${row.id}`) + '?mode=edit')
}

async function onDeleteSupplier(row) {
  $q.dialog({
    title: 'Confirm Deletion',
    message: `Are you sure you want to delete supplier "${row.name}" (${row.code})? This action cannot be undone.`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const result = await deleteSupplier(row.id)
    if (result.error) {
      $q.notify({
        type: 'negative',
        message: result.error,
      })
    } else {
      $q.notify({
        type: 'positive',
        message: 'Supplier deleted successfully',
      })
    }
  })
}
</script>

<template>
  <div class="tw:flex tw:flex-col tw:gap-3 tw:h-full tw:p-5">
    <SafeTeleport to="#main-header-title">
      <div class="tw:flex tw:items-center tw:gap-2 tw:text-on-sidebar">
        <WIcon icon="local_shipping" class="tw:text-primary" size="24px" />
        <h2 class="tw:text-lg tw:font-bold tw:tracking-tight tw:text-nowrap">Suppliers</h2>
      </div>
    </SafeTeleport>

    <SafeTeleport to="#main-header-actions">
      <WBtn
        v-if="canCreateSupplier"
        label="Create New Supplier"
        icon="add"
        color="primary"
        unelevated
        class="tw:font-medium"
        @click="onCreateSupplier"
      />
    </SafeTeleport>

    <!-- Page Header -->
    <div class="tw:flex tw:items-center tw:justify-between">
      <div class="tw:flex tw:flex-col tw:gap-1">
        <div class="tw:text-3xl tw:font-bold tw:text-on-sidebar">Suppliers</div>
        <div class="tw:text-sm tw:text-secondary">
          Manage and evaluate your global network of manufacturing partners.
        </div>
      </div>
    </div>

    <!-- Stats Card -->
    <div class="tw:grid tw:grid-cols-1 tw:md:grid-cols-4 tw:gap-4">
      <WCard class="tw:p-4">
        <div class="tw:flex tw:items-center tw:gap-4">
          <div
            class="tw:w-12 tw:h-12 tw:rounded-lg tw:bg-blue-50 tw:text-blue-600 tw:flex tw:items-center tw:justify-center"
          >
            <WIcon name="group" size="24px" />
          </div>
          <div>
            <div class="tw:text-xs tw:uppercase tw:tracking-tight tw:font-bold tw:text-secondary">
              Total Suppliers
            </div>
            <div class="tw:text-2xl tw:font-black tw:text-on-sidebar">
              {{ suppliers.length }}
            </div>
          </div>
        </div>
      </WCard>
    </div>

    <SuppliersFilterToolbar v-model:filters="filters" />

    <SuppliersTable
      :rows="suppliers"
      :loading="loading"
      :canUpdate="canUpdateSupplier"
      :canDelete="canDeleteSupplier"
      @delete="onDeleteSupplier"
      @edit="onEditSupplier"
    />
  </div>
</template>

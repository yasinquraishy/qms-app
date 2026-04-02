<script setup>
import { useQuasar } from 'quasar'
import { useDepartments } from '@/composables/useDepartments.js'
import { isAllowed } from '@/utils/currentSession.js'

const showDialog = ref(false)
const selectedDepartmentId = ref(null)

const { departments, loading, filters, deleteDepartment, fetchDepartments } = useDepartments()
const $q = useQuasar()

const canCreateDepartment = computed(() => isAllowed(['departments:create']))
const canUpdateDepartment = computed(() => isAllowed(['departments:update']))
const canDeleteDepartment = computed(() => isAllowed(['departments:delete']))

function openDialog(id = null) {
  selectedDepartmentId.value = id
  showDialog.value = true
}

onMounted(() => {
  fetchDepartments()
})

async function onDeleteDepartment(row) {
  $q.dialog({
    title: 'Confirm Deletion',
    message: `Are you sure you want to delete department "${row.name}" (${row.code})? This action cannot be undone.`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const result = await deleteDepartment(row.id)
    if (result.error) {
      $q.notify({
        type: 'negative',
        message: result.error,
      })
    } else {
      $q.notify({
        type: 'positive',
        message: 'Department deleted successfully',
      })
    }
  })
}

function onEditDepartment(row) {
  openDialog(row.id)
}
</script>

<template>
  <div class="tw:flex tw:flex-col tw:gap-3 tw:h-full tw:p-5">
    <SafeTeleport to="#main-header-title">
      <div class="tw:flex tw:items-center tw:gap-2 tw:text-on-sidebar">
        <WIcon icon="corporate_fare" class="tw:text-primary" size="24px" />
        <h2 class="tw:text-lg tw:font-bold tw:tracking-tight tw:text-nowrap">Departments</h2>
      </div>
    </SafeTeleport>

    <SafeTeleport to="#main-header-actions">
      <WBtn
        v-if="canCreateDepartment"
        label="Create New Department"
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
        <div class="tw:text-3xl tw:font-bold tw:text-on-sidebar">Departments</div>
        <div class="tw:text-sm tw:text-secondary">
          Manage departments within your organization's sites.
        </div>
      </div>
    </div>

    <DepartmentsFilterToolbar v-model:filters="filters" />

    <DepartmentsTable
      :rows="departments"
      :loading="loading"
      :canUpdate="canUpdateDepartment"
      :canDelete="canDeleteDepartment"
      @delete="onDeleteDepartment"
      @edit="onEditDepartment"
    />
  </div>

  <!-- Create/Edit Department Dialog -->
  <DepartmentsCreateUpdateDialog
    v-if="showDialog"
    :id="selectedDepartmentId"
    v-model="showDialog"
  />
</template>

<style scoped lang="scss">
.text-slate-800 {
  color: #1e293b;
}
</style>

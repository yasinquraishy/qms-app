<script setup>
import { getCompanyPath } from '@/utils/routeHelpers'
import { useRolePermissions } from '@/composables/useRolePermissions.js'
import { useRoles } from '@/composables/useRoles.js'
import { useQuasar } from 'quasar'
import { isAllowed } from '@/utils/currentSession.js'

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const $q = useQuasar()
const router = useRouter()
const role = ref(null)
const loading = ref(false)
const error = ref(null)

const canUpdateRole = computed(() => isAllowed(['roles:update']))

// Get useRoles composable
const { fetchRole, updateRole, deactivateRole, activateRole } = useRoles()

// Inline editing state
const isEditingName = ref(false)
const isEditingDescription = ref(false)
const editedName = ref('')
const editedDescription = ref('')
const nameInputRef = ref(null)
const descriptionInputRef = ref(null)

// User assignment dialog
const showUsersDialog = ref(false)

// Use the permissions composable
const {
  searchTerm,
  selectedPermissions,
  permissionActions,
  sectionedGroups,
  fetchPermissions,
  isSelected,
  togglePermission,
  getPermissionForAction,
  selectAll,
  setSelectedPermissions,
} = useRolePermissions()

const breadcrumbItems = computed(() => [
  { label: 'Roles', to: getCompanyPath('/roles') },
  { label: role.value?.name || 'Role Details' },
])

const usersCount = computed(() => role.value?.userAssignments?.length || 0)

const assignedUsers = computed(() => {
  return role.value?.userAssignments?.map((ua) => ua.user) || []
})

// Open users dialog
function openUsersDialog() {
  showUsersDialog.value = true
}

// Inline editing functions
async function startEditName() {
  if (!canUpdateRole.value) return
  editedName.value = role.value.name
  isEditingName.value = true
  await nextTick()
  nameInputRef.value?.focus()
}

function stopEditName() {
  if (editedName.value.trim()) {
    role.value = { ...role.value, name: editedName.value.trim() }
  }
  isEditingName.value = false
}

async function startEditDescription() {
  if (!canUpdateRole.value) return
  editedDescription.value = role.value.description || ''
  isEditingDescription.value = true
  await nextTick()
  descriptionInputRef.value?.focus()
}

function stopEditDescription() {
  role.value = { ...role.value, description: editedDescription.value.trim() }
  isEditingDescription.value = false
}

const isInactive = computed(() => role.value?.statusId === 'INACTIVE')

function handleDeactivate() {
  $q.dialog({
    title: 'Deactivate Role',
    message: `Are you sure you want to deactivate the role "${role.value.name}"?\n\nDeactivating a role will set its status to Inactive. The role will no longer be assignable to new users, but existing user assignments will remain unaffected.`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const success = await deactivateRole(props.id)
    if (success) {
      role.value = { ...role.value, statusId: 'INACTIVE' }
      $q.notify({ type: 'positive', message: 'Role deactivated successfully', position: 'top' })
    } else {
      $q.notify({ type: 'negative', message: 'Failed to deactivate role', position: 'top' })
    }
  })
}

function handleActivate() {
  $q.dialog({
    title: 'Activate Role',
    message: `Are you sure you want to activate the role "${role.value.name}"?\n\nActivating the role will set its status back to Active and allow it to be assigned to new users.`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const success = await activateRole(props.id)
    if (success) {
      role.value = { ...role.value, statusId: 'ACTIVE' }
      $q.notify({ type: 'positive', message: 'Role activated successfully', position: 'top' })
    } else {
      $q.notify({ type: 'negative', message: 'Failed to activate role', position: 'top' })
    }
  })
}

// Fetch role details
async function fetchRoleData() {
  if (!props.id) {
    return
  }

  loading.value = true
  error.value = null

  try {
    const fetchedRole = await fetchRole(props.id)

    if (!fetchedRole) {
      throw new Error('Role not found')
    }

    role.value = fetchedRole

    // Extract and set selected permissions
    const permissionIds = fetchedRole.permissionAssignments?.map((pa) => pa.permission.id) || []
    setSelectedPermissions(permissionIds)
  } finally {
    loading.value = false
  }
}

// Save changes
async function saveChanges() {
  if (!props.id) {
    return
  }

  loading.value = true
  error.value = null

  try {
    const updateData = {
      permissionIds: selectedPermissions.value,
    }

    updateData.name = role.value.name
    updateData.description = role.value.description ?? ''

    const result = await updateRole(props.id, updateData)

    if (!result.success) {
      throw new Error(result.error || 'Failed to update role')
    }

    $q.notify({
      type: 'positive',
      message: 'Role updated successfully',
      position: 'top',
    })

    // Update local role with response
    role.value = result.role

    // Stop editing modes
    isEditingName.value = false
    isEditingDescription.value = false

    goBack()
  } finally {
    loading.value = false
  }
}

// Cancel and go back
function goBack() {
  router.back()
}

// Initialize
onMounted(() => {
  fetchRoleData()
  fetchPermissions()
})

// Watch for id changes
watch(
  () => props.id,
  () => {
    if (props.id) {
      fetchRoleData()
    }
  },
)
</script>

<template>
  <div class="tw:flex tw:flex-col tw:h-full">
    <!-- Loading State -->
    <div v-if="loading && !role" class="tw:flex tw:items-center tw:justify-center tw:h-full">
      <QSpinner color="primary" size="3em" />
    </div>

    <!-- Error State -->
    <div
      v-else-if="error && !role"
      class="tw:flex tw:items-center tw:justify-center tw:h-full tw:flex-col tw:gap-4"
    >
      <WIcon icon="error" size="48px" class="tw:text-negative" />
      <div class="tw:text-lg tw:text-on-sidebar">{{ error }}</div>
      <WBtn label="Go Back" icon="arrow_back" outline color="primary" @click="goBack" />
    </div>

    <!-- Content -->
    <div v-else-if="role" class="tw:flex tw:flex-col tw:h-full tw:overflow-hidden">
      <!-- Header Actions -->
      <SafeTeleport to="#main-header-title">
        <WBreadcrumbs :items="breadcrumbItems" />
      </SafeTeleport>

      <SafeTeleport to="#main-header-actions">
        <div class="tw:flex tw:items-center tw:gap-3">
          <template v-if="canUpdateRole">
            <WBtn label="Cancel" color="grey-7" outline class="tw:font-bold" @click="goBack" />
            <WBtn
              label="Save Changes"
              icon="save"
              color="primary"
              unelevated
              class="tw:font-bold"
              :loading="loading"
              @click="saveChanges"
            />
          </template>
          <WBtn
            v-if="role && canUpdateRole && isInactive"
            label="Activate"
            icon="check_circle"
            color="positive"
            outline
            class="tw:font-bold"
            @click="handleActivate"
          />
          <WBtn
            v-else-if="role && canUpdateRole && !isInactive"
            label="Deactivate"
            icon="block"
            color="warning"
            outline
            class="tw:font-bold"
            @click="handleDeactivate"
          />
        </div>
      </SafeTeleport>

      <!-- Scrollable Content -->
      <div class="tw:flex-1 tw:overflow-y-auto custom-scrollbar tw:px-8 tw:py-6 tw:space-y-6">
        <!-- Role Info Card -->
        <section class="tw:bg-layer tw:rounded-xl tw:border tw:border-sidebar tw:p-6 tw:shadow-sm">
          <div class="tw:flex tw:flex-wrap tw:justify-between tw:items-start tw:gap-4">
            <div class="tw:space-y-1 tw:flex-1">
              <!-- Editable Name -->
              <div v-if="isEditingName" class="tw:flex tw:items-center tw:gap-2">
                <WInput
                  ref="nameInputRef"
                  v-model="editedName"
                  dense
                  outlined
                  class="tw:text-3xl"
                  @blur="stopEditName"
                  @keyup.enter="stopEditName"
                  @keyup.escape="stopEditName"
                />
              </div>
              <h2
                v-else
                class="tw:text-3xl tw:font-black tw:tracking-tight tw:text-on-sidebar"
                :class="
                  canUpdateRole
                    ? 'tw:cursor-pointer tw:hover:text-primary tw:transition-colors'
                    : ''
                "
                @click="canUpdateRole && startEditName()"
              >
                {{ role.name }}
              </h2>

              <!-- Editable Description -->
              <div v-if="isEditingDescription" class="tw:flex tw:items-start tw:gap-2">
                <WInput
                  ref="descriptionInputRef"
                  v-model="editedDescription"
                  type="textarea"
                  dense
                  outlined
                  class="tw:flex-1"
                  rows="2"
                  @blur="stopEditDescription"
                  @keyup.escape="stopEditDescription"
                />
              </div>
              <p
                v-else
                class="tw:text-secondary tw:max-w-2xl tw:transition-colors"
                :class="canUpdateRole ? 'tw:cursor-pointer tw:hover:text-on-sidebar' : ''"
                @click="canUpdateRole && startEditDescription()"
              >
                {{
                  role.description ||
                  (canUpdateRole
                    ? 'No description provided (click to edit)'
                    : 'No description provided')
                }}
              </p>

              <div class="tw:flex tw:items-center tw:gap-4 tw:pt-2">
                <div class="tw:flex tw:items-center tw:gap-2">
                  <WIcon icon="history" size="16px" class="tw:text-secondary" />
                  <span class="tw:text-xs tw:text-secondary">
                    Last Modified: {{ role.updatedAt.formatDate('date') }}
                  </span>
                </div>

                <RoleStatusBadge :status="role.statusId" />
              </div>
            </div>
            <div class="tw:flex tw:flex-col tw:items-end tw:gap-3">
              <div class="ds-label tw:text-secondary">Assigned Users</div>
              <div class="tw:flex tw:items-center tw:gap-2">
                <div
                  class="tw:w-10 tw:h-10 tw:rounded-full tw:bg-primary/10 tw:flex tw:items-center tw:justify-center tw:text-sm tw:font-bold tw:text-primary"
                >
                  {{ usersCount }}
                </div>
              </div>
              <WBtn
                label="View All Users"
                size="sm"
                flat
                color="primary"
                class="tw:font-semibold"
                @click="openUsersDialog"
              />
            </div>
          </div>
        </section>

        <!-- Permissions Section Header -->
        <div class="tw:flex tw:items-center tw:justify-between tw:pt-4">
          <h3 class="tw:text-xl tw:font-bold tw:text-on-sidebar">Permissions</h3>
          <div class="tw:flex tw:items-center tw:gap-4">
            <div class="tw:relative">
              <WInput
                v-model="searchTerm"
                placeholder="Search permissions..."
                dense
                outlined
                class="tw:w-64"
              >
                <template #prepend>
                  <WIcon icon="search" size="18px" class="tw:text-secondary" />
                </template>
              </WInput>
            </div>
            <WBtn
              v-if="canUpdateRole"
              label="Select All"
              icon="select_all"
              flat
              color="primary"
              size="sm"
              class="tw:font-semibold"
              @click="selectAll"
            />
          </div>
        </div>

        <!-- Permission Groups -->
        <RolePermissionsList
          v-model="sectionedGroups"
          :permissionActions="permissionActions"
          :isSelected="isSelected"
          :togglePermission="togglePermission"
          :getPermissionForAction="getPermissionForAction"
          :canUpdateRole="canUpdateRole"
        />
      </div>
    </div>

    <!-- Users Assignment Dialog -->
    <RoleUsersDialog
      v-if="showUsersDialog"
      v-model="showUsersDialog"
      :roleId="id"
      :roleName="role?.name"
      :assignedUsers="assignedUsers"
      @saved="fetchRoleData"
    />
  </div>
</template>

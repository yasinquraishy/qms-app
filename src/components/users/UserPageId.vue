<script setup>
import { useQuasar } from 'quasar'
import { required, helpers } from '@vuelidate/validators'
import { useValidator } from '@shared/composables/validator.js'
import { getCompanyPath } from '@/utils/routeHelpers'
import { isAllowed, currentSession } from '@/utils/currentSession.js'
import { uploadFile } from '@/utils/uploadService.js'

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const $q = useQuasar()
const { getUser, updateUser, inviteUser } = useUsers()
const { roles, loading: loadingRoles } = useRoles()

const loading = ref(false)
const saving = ref(false)
const user = ref(null)
const showEditDialog = ref(false)
const showAvatarDialog = ref(false)
const uploadingAvatar = ref(false)
const sendingInvite = ref(false)

const canUpdateUser = computed(() => isAllowed(['users:update']))

const languageOptions = [
  { label: 'English (US)', value: 'en-US' },
  { label: 'English (UK)', value: 'en-GB' },
  { label: 'Spanish', value: 'es' },
  { label: 'French', value: 'fr' },
  { label: 'German', value: 'de' },
  { label: 'Italian', value: 'it' },
  { label: 'Portuguese', value: 'pt' },
  { label: 'Chinese', value: 'zh' },
  { label: 'Japanese', value: 'ja' },
]

const userStatusOptions = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
]

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  languageId: 'en-US',
  timeZone: 'UTC',
  roleIds: [],
  color: '#2563eb',
  siteId: null,
  departmentId: null,
  userStatusId: 'ACTIVE',
})

const formRules = computed(() => ({
  firstName: { required: helpers.withMessage('Required', required) },
  lastName: { required: helpers.withMessage('Required', required) },
}))

const validator = useValidator(formRules, form)

// Computed Properties
const assignedRoles = computed(() => {
  if (!user.value?.roleAssignments) return []
  return user.value.roleAssignments
    .map((ra) => roles.value.find((r) => r.id === ra.roleId))
    .filter(Boolean)
})

const assignedRolesText = computed(() => {
  if (assignedRoles.value.length === 0) return 'No roles assigned'
  if (assignedRoles.value.length === 1) return assignedRoles.value[0].name
  return `${assignedRoles.value.length} roles assigned`
})

const breadcrumbItems = computed(() => [
  { label: 'Users', to: getCompanyPath('/users') },
  { label: user.value ? `${user.value.firstName} ${user.value.lastName}` : 'Loading...' },
])

// Fetch Data
async function loadUser() {
  loading.value = true
  const result = await getUser(props.id)
  loading.value = false

  if (result.error) {
    $q.notify({
      type: 'negative',
      message: result.error,
    })
    return
  }

  if (result.user) {
    user.value = { ...result.user }
    form.value = {
      firstName: result.user.firstName,
      lastName: result.user.lastName,
      email: result.user.email,
      languageId: result.user.languageId || 'en-US',
      timeZone: result.user.timeZone || 'UTC',
      roleIds: result.user.roleAssignments?.map((ra) => ra.roleId) || [],
      color: result.user.color,
      siteId: result.user.siteId,
      departmentId: result.user.departmentId,
      userStatusId: result.user.userStatusId || 'ACTIVE',
    }
  }
}

// Send Invitation
async function sendInvitation() {
  sendingInvite.value = true
  const result = await inviteUser(props.id)
  sendingInvite.value = false

  if (result.error) {
    $q.notify({
      type: 'negative',
      message: result.error,
    })
  } else {
    $q.notify({
      type: 'positive',
      message: 'Invitation sent successfully',
    })
    if (user.value) {
      user.value = { ...user.value, inviteSent: true }
    }
  }
}

// Open Edit Dialog
function openEditDialog() {
  showEditDialog.value = true
}

// Save Data
async function save() {
  const valid = await validator.value.$validate()
  if (!valid) return

  saving.value = true
  const result = await updateUser(props.id, form.value)
  saving.value = false

  if (result.error) {
    $q.notify({
      type: 'negative',
      message: result.error,
    })
  } else {
    $q.notify({
      type: 'positive',
      message: 'User updated successfully',
    })
    user.value = result.user
    form.value = {
      firstName: result.user.firstName,
      lastName: result.user.lastName,
      email: result.user.email,
      languageId: result.user.languageId || 'en-US',
      timeZone: result.user.timeZone || 'UTC',
      siteId: result.user.siteId,
      departmentId: result.user.departmentId,
      roleIds: result.user.roleAssignments?.map((ra) => ra.roleId) || [],
      color: result.user.color,
      userStatusId: result.user.userStatusId || 'ACTIVE',
    }
    showEditDialog.value = false
  }
}

// View Audit Logs
function viewAuditLogs() {
  $q.notify({
    type: 'info',
    message: 'Audit logs functionality coming soon',
  })
}

// Open Avatar Dialog
function openAvatarDialog() {
  if (!canUpdateUser.value) {
    $q.notify({
      type: 'warning',
      message: 'You do not have permission to update this user',
    })
    return
  }
  showAvatarDialog.value = true
}

// Save Avatar
async function handleAvatarSave({ file }) {
  uploadingAvatar.value = true

  try {
    // Upload to server
    const asset = await uploadFile(file, currentSession.value.companyId, 'USERAVATAR')

    // Update user with new avatar URL
    const updateResult = await updateUser(props.id, {
      avatar: asset.url,
    })

    if (updateResult.error) {
      $q.notify({
        type: 'negative',
        message: updateResult.error,
      })
    } else {
      $q.notify({
        type: 'positive',
        message: 'Profile picture updated successfully',
      })
      // Update local user state
      user.value = updateResult.user
      showAvatarDialog.value = false
    }
  } finally {
    uploadingAvatar.value = false
  }
}

// Delete Avatar
async function handleAvatarDelete() {
  uploadingAvatar.value = true
  const updateResult = await updateUser(props.id, {
    avatar: null,
  })
  uploadingAvatar.value = false

  if (updateResult.error) {
    $q.notify({
      type: 'negative',
      message: updateResult.error,
    })
  } else {
    $q.notify({
      type: 'positive',
      message: 'Profile picture removed successfully',
    })
    // Update local user state
    user.value = updateResult.user
    showAvatarDialog.value = false
  }
}

onMounted(() => {
  loadUser()
})

watch(
  () => props.id,
  () => {
    loadUser()
  },
)
</script>

<template>
  <div class="tw:flex tw:flex-col tw:h-full">
    <!-- Breadcrumbs Teleport -->
    <SafeTeleport to="#main-header-title">
      <WBreadcrumbs :items="breadcrumbItems" />
    </SafeTeleport>

    <!-- Actions Teleport -->
    <SafeTeleport to="#main-header-actions">
      <div class="tw:flex tw:items-center tw:gap-3">
        <WBtn
          v-if="canUpdateUser && user && !user.inviteSent"
          label="Send Invitation"
          color="secondary"
          unelevated
          :loading="sendingInvite"
          class="tw:px-4 tw:py-2 tw:text-sm tw:font-bold"
          @click="sendInvitation"
        />
        <WBtn
          v-if="canUpdateUser"
          label="Edit Profile"
          color="primary"
          unelevated
          class="tw:px-4 tw:py-2 tw:text-sm tw:font-bold"
          @click="openEditDialog"
        />
      </div>
    </SafeTeleport>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="tw:flex tw:flex-col tw:items-center tw:justify-center tw:flex-1 tw:py-8"
    >
      <QSpinner color="primary" size="48px" />
      <div class="tw:text-sm tw:text-secondary tw:mt-3">Loading user...</div>
    </div>

    <!-- Content -->
    <div v-else class="tw:flex-1 tw:overflow-y-auto tw:p-8">
      <div class="tw:max-w-5xl tw:mx-auto tw:space-y-6">
        <!-- Profile Header Card -->
        <div class="tw:bg-sidebar tw:rounded-xl tw:border tw:border-divider tw:p-8">
          <div
            class="tw:flex tw:flex-col tw:md:flex-row tw:items-center tw:md:items-start tw:gap-6"
          >
            <div
              class="tw:relative tw:group"
              :class="{ 'tw:cursor-pointer': canUpdateUser }"
              @click="canUpdateUser ? openAvatarDialog() : null"
            >
              <UserAvatar :user="user" :showBadge="true" class="tw:size-24" />
              <div
                v-if="canUpdateUser"
                class="tw:absolute tw:inset-0 tw:bg-black/50 tw:rounded-full tw:flex tw:items-center tw:justify-center tw:opacity-0 tw:group-hover:opacity-100 tw:transition-opacity tw:pointer-events-none"
              >
                <QIcon name="photo_camera" size="32px" class="tw:text-white" />
              </div>
            </div>
            <div
              class="tw:flex tw:flex-col tw:items-center tw:md:items-start tw:text-center tw:md:text-left tw:pt-2"
            >
              <div class="tw:flex tw:items-center tw:gap-3 tw:mb-1 tw:flex-wrap">
                <h2 class="tw:text-3xl tw:font-bold tw:text-on-sidebar">
                  {{ user?.firstName }} {{ user?.lastName }}
                </h2>
                <WStatusBadge :status="user?.userStatusId" />
              </div>
              <p class="tw:text-lg tw:text-secondary tw:mb-4">
                {{ assignedRolesText }}
              </p>
              <div class="tw:flex tw:flex-wrap tw:justify-center tw:md:justify-start tw:gap-4">
                <div class="tw:flex tw:items-center tw:gap-2 tw:text-secondary tw:text-sm">
                  <QIcon name="mail" size="18px" />
                  {{ user?.email }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Two Column Layout -->
        <div class="tw:grid tw:grid-cols-1 tw:lg:grid-cols-2 tw:gap-6">
          <!-- Left Column: Personal Information -->
          <div class="tw:bg-sidebar tw:rounded-xl tw:border tw:border-divider tw:overflow-hidden">
            <div class="tw:px-6 tw:py-4 tw:border-b tw:border-divider tw:bg-main-hover">
              <h3 class="tw:text-base tw:font-bold tw:text-on-main">Personal Information</h3>
            </div>
            <div class="tw:p-6 tw:space-y-6">
              <div class="tw:grid tw:grid-cols-1 tw:sm:grid-cols-2 tw:gap-4">
                <div>
                  <p class="ds-label tw:text-secondary tw:mb-1">Email Address</p>
                  <p class="tw:text-sm tw:text-on-sidebar tw:font-medium">{{ user?.email }}</p>
                </div>
                <div>
                  <p class="ds-label tw:text-secondary tw:mb-1">Phone Number</p>
                  <p class="tw:text-sm tw:text-secondary tw:italic">—</p>
                </div>
                <div>
                  <p class="ds-label tw:text-secondary tw:mb-1">Preferred Language</p>
                  <p class="tw:text-sm tw:text-on-sidebar tw:font-medium">
                    {{
                      languageOptions.find((l) => l.value === user?.languageId)?.label ||
                      user?.languageId ||
                      '—'
                    }}
                  </p>
                </div>
                <div>
                  <p class="ds-label tw:text-secondary tw:mb-1">Timezone</p>
                  <p class="tw:text-sm tw:text-on-sidebar tw:font-medium">
                    {{ user?.timeZone || '—' }}
                  </p>
                </div>
                <div>
                  <p class="ds-label tw:text-secondary tw:mb-1">Site</p>
                  <p class="tw:text-sm tw:text-on-sidebar tw:font-medium">
                    {{ user?.site?.name || '—' }}
                  </p>
                </div>
                <div>
                  <p class="ds-label tw:text-secondary tw:mb-1">Department</p>
                  <p class="tw:text-sm tw:text-on-sidebar tw:font-medium">
                    {{ user?.department?.name || '—' }}
                  </p>
                </div>
              </div>
              <div class="tw:pt-4 tw:border-t tw:border-divider">
                <p class="ds-label tw:text-secondary tw:mb-3">User Color</p>
                <div class="tw:flex tw:items-center tw:gap-3 tw:p-3 tw:bg-main-hover tw:rounded-lg">
                  <div
                    class="tw:size-10 tw:rounded tw:shrink-0"
                    :style="{ backgroundColor: user?.color || '#2563eb' }"
                  ></div>
                  <div>
                    <p class="tw:text-sm tw:font-bold tw:text-on-main">
                      {{ user?.color || '#2563eb' }}
                    </p>
                    <p class="tw:text-xs tw:text-secondary">Used for avatar and identification</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Role Assignments -->
          <div class="tw:bg-sidebar tw:rounded-xl tw:border tw:border-divider tw:overflow-hidden">
            <div
              class="tw:px-6 tw:py-4 tw:border-b tw:border-divider tw:bg-main-hover tw:flex tw:justify-between tw:items-center"
            >
              <h3 class="tw:text-base tw:font-bold tw:text-on-main">Role Assignments</h3>
            </div>
            <div class="tw:p-6 tw:space-y-4">
              <template v-if="assignedRoles.length > 0">
                <div
                  v-for="role in assignedRoles"
                  :key="role.id"
                  class="tw:flex tw:items-start tw:gap-4 tw:p-4 tw:border tw:border-divider tw:rounded-lg tw:hover:border-primary/30 tw:transition-colors"
                >
                  <div
                    class="tw:size-10 tw:rounded tw:bg-primary/10 tw:flex tw:items-center tw:justify-center tw:text-primary tw:shrink-0"
                  >
                    <QIcon name="verified_user" size="20px" />
                  </div>
                  <div>
                    <h4 class="tw:text-sm tw:font-bold tw:text-on-sidebar">{{ role.name }}</h4>
                    <p class="tw:text-xs tw:text-secondary tw:mt-1">
                      {{ role.description || 'No description available' }}
                    </p>
                  </div>
                </div>
                <div class="tw:bg-primary/5 tw:rounded-lg tw:p-4 tw:mt-2">
                  <div
                    class="tw:flex tw:items-center tw:gap-2 tw:text-primary tw:text-xs tw:font-bold tw:mb-1"
                  >
                    <QIcon name="info" size="14px" />
                    Permission Note
                  </div>
                  <p class="tw:text-xs tw:text-secondary">
                    User currently has limited access to administrative configurations but full
                    access to workflows.
                  </p>
                </div>
              </template>
              <div v-else class="tw:text-center tw:py-8">
                <QIcon name="shield_with_heart" size="48px" class="tw:text-secondary tw:mb-2" />
                <p class="tw:text-sm tw:text-secondary">No roles assigned yet</p>
              </div>
            </div>
          </div>
        </div>

        <!-- System Metadata Footer -->
        <div
          class="tw:bg-sidebar tw:rounded-xl tw:border tw:border-divider tw:p-6 tw:flex tw:flex-col tw:md:flex-row tw:justify-between tw:items-center tw:gap-4"
        >
          <div class="tw:flex tw:items-center tw:gap-6">
            <div class="tw:flex tw:flex-col">
              <span class="ds-label-sm tw:text-secondary"> Account Created </span>
              <span class="tw:text-sm tw:font-medium tw:text-on-sidebar">
                {{ user?.createdAt.formatDate('date') }}
              </span>
            </div>
            <div class="tw:w-px tw:h-8 tw:bg-divider tw:hidden tw:md:block"></div>
            <div class="tw:flex tw:flex-col">
              <span class="ds-label-sm tw:text-secondary"> Last Updated </span>
              <span class="tw:text-sm tw:font-medium tw:text-on-sidebar">
                {{ user?.updatedAt.formatDate('date') }}
              </span>
            </div>
          </div>
          <button
            class="tw:flex tw:items-center tw:gap-2 tw:px-3 tw:py-1.5 tw:bg-main-hover tw:rounded-full tw:text-secondary tw:cursor-pointer tw:hover:bg-divider tw:transition-colors"
            @click="viewAuditLogs"
          >
            <QIcon name="history" size="14px" />
            <span class="tw:text-xs tw:font-medium">View Audit Logs</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Dialog -->
    <WDialog v-model="showEditDialog" title="Edit User Profile">
      <div class="tw:space-y-4">
        <div class="tw:grid tw:grid-cols-2 tw:gap-4">
          <WInput v-model="form.firstName" name="firstName" placeholder="e.g. John">
            <template #label> First Name <span class="tw:text-bad">*</span> </template>
          </WInput>
          <WInput v-model="form.lastName" name="lastName" placeholder="e.g. Doe">
            <template #label> Last Name <span class="tw:text-bad">*</span> </template>
          </WInput>
        </div>
        <div class="tw:grid tw:grid-cols-2 tw:gap-4">
          <WSelect
            v-model="form.languageId"
            label="Preferred Language"
            :options="languageOptions"
            optionLabel="label"
            optionValue="value"
            emitValue
            mapOptions
          />
          <WSelect
            v-model="form.userStatusId"
            label="User Status"
            :options="userStatusOptions"
            optionLabel="label"
            optionValue="value"
            emitValue
            mapOptions
          />
        </div>
        <div class="tw:grid tw:grid-cols-2 tw:gap-4">
          <TimezoneDropdown v-model="form.timeZone" label="Timezone" />
        </div>
        <div class="tw:grid tw:grid-cols-2 tw:gap-4">
          <UsersSiteSelect v-model:siteId="form.siteId" :required="true">
            <template #label> Site <span class="tw:text-bad">*</span> </template>
          </UsersSiteSelect>
          <UsersDepartmentSelect
            v-model:departmentId="form.departmentId"
            :siteId="form.siteId"
            :required="true"
          >
            <template #label> Department <span class="tw:text-bad">*</span> </template>
          </UsersDepartmentSelect>
        </div>
        <WSelect
          v-model="form.roleIds"
          label="Assigned Roles"
          :options="roles"
          optionLabel="name"
          optionValue="id"
          multiple
          :loading="loadingRoles"
          emitValue
          mapOptions
        >
          <template #label> Assigned Roles </template>
          <template #option="{ itemProps, opt }">
            <QItem v-bind="itemProps">
              <QItemSection>
                <QItemLabel>{{ opt.name }}</QItemLabel>
                <QItemLabel caption>{{ opt.description }}</QItemLabel>
              </QItemSection>
            </QItem>
          </template>
        </WSelect>
        <div>
          <div class="tw:text-xs tw:text-secondary tw:mb-2 tw:font-bold tw:uppercase">
            User Color
          </div>
          <WColorPicker v-model="form.color" />
        </div>
      </div>
      <template #actions>
        <WBtn label="Cancel" flat color="secondary" @click="showEditDialog = false" />
        <WBtn
          label="Save Changes"
          unelevated
          color="primary"
          :loading="saving"
          :disable="saving"
          @click="save"
        />
      </template>
    </WDialog>

    <!-- Avatar Management Dialog -->
    <ImageCropDialog
      v-model="showAvatarDialog"
      :currentImageUrl="user?.avatar"
      title="Profile Picture"
      :aspectRatio="1"
      @save="handleAvatarSave"
      @delete="handleAvatarDelete"
    />
  </div>
</template>

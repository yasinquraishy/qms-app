<script setup>
import { useQuasar } from 'quasar'
import { getCompanyPath } from '@/utils/routeHelpers'
import { isAllowed, currentSession } from '@/utils/currentSession'
import { currentCompany } from '@/utils/currentCompany'
import { uploadFile } from '@/utils/uploadService.js'

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const $q = useQuasar()
const { getGroup } = useGroups()

const loading = ref(false)
const group = ref(null)
const editDialogOpen = ref(false)
const showAvatarDialog = ref(false)
const uploadingAvatar = ref(false)

const breadcrumbs = computed(() => {
  return [
    { label: 'Teams', to: getCompanyPath('/groups') },
    { label: group.value?.name || 'Loading...' },
  ]
})

const canUpdate = computed(() => isAllowed(['teams:update']))

const memberCount = computed(() => {
  return group.value?.userAssignments?.length || 0
})

const teamMembers = computed(() => {
  if (!group.value?.userAssignments) return []
  return group.value.userAssignments.map((assignment) => assignment.user).filter(Boolean)
})

const organizationName = computed(() => {
  return currentCompany.value?.name || 'Organization'
})

// Fetch Data
async function loadGroup() {
  loading.value = true
  const result = await getGroup(props.id)
  loading.value = false

  if (result.error) {
    $q.notify({
      type: 'negative',
      message: result.error,
    })
    return
  }

  if (result.group) {
    group.value = result.group
  }
}

function onEditClick() {
  editDialogOpen.value = true
}

async function onGroupUpdated() {
  await loadGroup()
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
  $q.notify({
    type: 'positive',
    message: 'Copied to clipboard',
    timeout: 1000,
  })
}

// Open Avatar Dialog
function openAvatarDialog() {
  if (!canUpdate.value) {
    $q.notify({
      type: 'warning',
      message: 'You do not have permission to update this team',
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
    const asset = await uploadFile(file, currentSession.value.companyId, 'TEAMAVATAR')

    // Update team with new avatar URL
    const { updateGroup } = useGroups()
    const updateResult = await updateGroup(props.id, {
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
        message: 'Team avatar updated successfully',
      })
      // Update local group state
      group.value = updateResult.group
      showAvatarDialog.value = false
    }
  } finally {
    uploadingAvatar.value = false
  }
}

// Delete Avatar
async function handleAvatarDelete() {
  uploadingAvatar.value = true
  const { updateGroup } = useGroups()
  const updateResult = await updateGroup(props.id, {
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
      message: 'Team avatar removed successfully',
    })
    // Update local group state
    group.value = updateResult.group
    showAvatarDialog.value = false
  }
}

onMounted(() => {
  loadGroup()
})

watch(
  () => props.id,
  () => {
    loadGroup()
  },
)
</script>

<template>
  <div class="tw:flex tw:flex-col tw:h-full">
    <SafeTeleport to="#main-header-title">
      <WBreadcrumbs :items="breadcrumbs" />
    </SafeTeleport>

    <SafeTeleport to="#main-header-actions">
      <div class="tw:flex tw:gap-2">
        <WBtn
          v-if="canUpdate"
          label="Edit Team"
          icon="edit"
          color="primary"
          unelevated
          class="tw:px-6 tw:font-bold"
          @click="onEditClick"
        />
      </div>
    </SafeTeleport>

    <!-- Loading State -->
    <div v-if="loading" class="tw:flex tw:flex-col tw:items-center tw:justify-center tw:py-16">
      <QSpinner color="primary" size="48px" />
      <div class="tw:text-sm tw:text-secondary tw:mt-3">Loading team...</div>
    </div>

    <!-- Content -->
    <div v-else class="tw:overflow-y-auto">
      <div class="tw:max-w-5xl tw:mx-auto tw:p-8 tw:space-y-8">
        <!-- Profile Header -->
        <div class="tw:bg-sidebar tw:border tw:border-divider tw:p-6 tw:rounded-xl tw:shadow-sm">
          <div
            class="tw:flex tw:flex-col tw:md:flex-row tw:items-start tw:md:items-center tw:justify-between tw:gap-6"
          >
            <div class="tw:flex tw:items-center tw:gap-6">
              <div
                class="tw:relative tw:group"
                :class="{ 'tw:cursor-pointer': canUpdate }"
                @click="canUpdate ? openAvatarDialog() : null"
              >
                <TeamAvatar :team="group" class="tw:size-24" />
                <div
                  v-if="canUpdate"
                  class="tw:absolute tw:inset-0 tw:bg-black/50 tw:rounded-2xl tw:flex tw:items-center tw:justify-center tw:opacity-0 tw:group-hover:opacity-100 tw:transition-opacity tw:pointer-events-none"
                >
                  <QIcon name="photo_camera" size="32px" class="tw:text-white" />
                </div>
              </div>
              <div>
                <div class="tw:flex tw:items-center tw:gap-3 tw:mb-1">
                  <h2 class="tw:text-2xl tw:font-bold tw:text-on-main">
                    {{ group?.name || 'Team' }}
                  </h2>
                  <QBadge
                    v-if="group?.isLeadership"
                    color="primary"
                    class="tw:px-3 tw:py-1 tw:rounded-full"
                  >
                    <span class="ds-label-sm"> Leadership </span>
                  </QBadge>
                </div>
                <p class="tw:text-secondary tw:flex tw:items-center tw:gap-2">
                  <QIcon name="domain" size="sm" />
                  {{ organizationName }}
                </p>
                <p class="tw:text-secondary tw:text-sm tw:mt-1">Team Details</p>
              </div>
            </div>
          </div>
        </div>

        <div class="tw:grid tw:grid-cols-1 tw:lg:grid-cols-3 tw:gap-8">
          <!-- Team Overview Card -->
          <div class="tw:lg:col-span-1 tw:space-y-6">
            <div
              class="tw:bg-sidebar tw:border tw:border-divider tw:rounded-xl tw:shadow-sm tw:overflow-hidden"
            >
              <div class="tw:px-6 tw:py-4 tw:border-b tw:border-divider tw:bg-main-hover">
                <h3 class="tw:font-bold tw:text-on-main tw:text-sm tw:uppercase tw:tracking-wide">
                  Team Overview
                </h3>
              </div>
              <div class="tw:p-6 tw:space-y-5">
                <div>
                  <label class="ds-label-sm tw:text-secondary tw:block tw:mb-1"> Team ID </label>
                  <div class="tw:flex tw:items-center tw:justify-between tw:group">
                    <code
                      class="tw:text-sm tw:text-on-main tw:bg-main tw:font-mono tw:break-all tw:p-1"
                    >
                      {{ id }}
                    </code>
                    <WBtn
                      flat
                      dense
                      round
                      icon="content_copy"
                      size="sm"
                      class="tw:ml-2 tw:opacity-0 tw:group-hover:opacity-100 tw:transition-opacity"
                      @click="copyToClipboard(id)"
                    />
                  </div>
                </div>
                <div>
                  <label class="ds-label-sm tw:text-secondary tw:block tw:mb-1">
                    Organization
                  </label>
                  <p class="tw:text-sm tw:text-on-main tw:font-medium">{{ organizationName }}</p>
                  <p class="tw:text-xs tw:text-secondary">Global Operations</p>
                </div>
                <div class="tw:pt-4 tw:border-t tw:border-divider">
                  <label class="ds-label-sm tw:text-secondary tw:block tw:mb-1">
                    Team Status
                  </label>
                  <div class="tw:flex tw:items-center tw:gap-2">
                    <span class="tw:w-2 tw:h-2 tw:rounded-full tw:bg-good"></span>
                    <span class="tw:text-sm tw:font-semibold tw:text-on-main">Active</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Stats Card -->
            <div class="tw:rounded-xl tw:p-6 tw:text-white tw:shadow-lg tw:bg-primary">
              <div class="tw:relative tw:z-10">
                <p class="ds-label tw:text-white/80 tw:mb-4 tw:opacity-80">Quick Stats</p>
                <div class="tw:space-y-4">
                  <div class="tw:flex tw:justify-between tw:items-center">
                    <span class="tw:text-sm tw:opacity-90">Total Members</span>
                    <span class="tw:text-xl tw:font-bold">{{
                      memberCount.toString().padStart(2, '0')
                    }}</span>
                  </div>
                </div>
              </div>
              <div class="tw:absolute tw:-right-4 tw:-bottom-4 tw:opacity-10">
                <QIcon name="hub" size="100px" />
              </div>
            </div>
          </div>

          <!-- User Assignments -->
          <div class="tw:lg:col-span-2 tw:space-y-6">
            <div class="tw:bg-sidebar tw:border tw:border-divider tw:rounded-xl tw:shadow-sm">
              <div
                class="tw:px-6 tw:py-4 tw:border-b tw:border-divider tw:flex tw:items-center tw:justify-between tw:bg-main-hover"
              >
                <div class="tw:flex tw:items-center tw:gap-2">
                  <h3 class="tw:font-bold tw:text-on-main tw:text-sm tw:uppercase tw:tracking-wide">
                    User Assignments
                  </h3>
                  <QBadge color="grey-5" textColor="grey-8" class="tw:rounded-full">
                    <span class="tw:text-[10px] tw:px-2 tw:py-0.5 tw:font-bold">
                      {{ memberCount }} {{ memberCount === 1 ? 'Member' : 'Members' }}
                    </span>
                  </QBadge>
                </div>
              </div>
              <div v-if="teamMembers.length > 0" class="tw:divide-y tw:divide-divider">
                <div
                  v-for="user in teamMembers"
                  :key="user.id"
                  class="tw:p-4 tw:hover:bg-main-hover tw:transition-colors"
                >
                  <UsersListItem :user="user" />
                </div>
              </div>
              <div
                v-else
                class="tw:p-8 tw:text-center tw:bg-main-hover/20 tw:border-dashed tw:border-2 tw:border-divider tw:rounded-b-xl"
              >
                <QIcon name="group_add" size="40px" class="tw:text-secondary/50 tw:mb-2" />
                <p class="tw:text-secondary tw:text-sm">
                  Assign team members to collaborate on Quality Management workflows.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Dialog -->
    <GroupsEditDialog
      v-if="group"
      v-model="editDialogOpen"
      :groupId="id"
      @updated="onGroupUpdated"
    />

    <!-- Avatar Management Dialog -->
    <ImageCropDialog
      v-model="showAvatarDialog"
      :currentImageUrl="group?.avatar"
      title="Team Avatar"
      :aspectRatio="1"
      @save="handleAvatarSave"
      @delete="handleAvatarDelete"
    />
  </div>
</template>

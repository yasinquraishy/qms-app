<script setup>
import { currentCompany } from '@/utils/currentCompany.js'
import { isAllowed } from '@/utils/currentSession'
import { useQuasar } from 'quasar'
import { get, put } from '@/api'

const props = defineProps({
  roleId: {
    type: String,
    required: true,
  },
  roleName: {
    type: String,
    default: '',
  },
  assignedUsers: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['saved'])

const open = defineModel({
  type: Boolean,
  default: false,
})

const $q = useQuasar()
const allUsers = ref([])
const selectedUserIds = ref([])
const loading = ref(false)
const searchTerm = ref('')

const filteredUsers = computed(() => {
  if (!searchTerm.value.trim()) {
    return allUsers.value
  }

  const search = searchTerm.value.toLowerCase()
  return allUsers.value.filter((user) => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase()
    const email = user.email.toLowerCase()
    return fullName.includes(search) || email.includes(search)
  })
})

const canUpdateRole = computed(() => isAllowed(['roles:update']))

// Fetch all company users
async function fetchAllUsers() {
  const companyId = currentCompany.value?.id

  if (!companyId) {
    return
  }

  const data = await get('/v1/services/users', {
    params: { companyId },
    loader: loading,
  })
  allUsers.value = data.users || []
}

// Check if user is selected
function isUserSelected(userId) {
  return selectedUserIds.value.includes(userId)
}

// Toggle user selection
function toggleUserSelection(userId) {
  if (!canUpdateRole.value) return

  const index = selectedUserIds.value.indexOf(userId)
  if (index > -1) {
    selectedUserIds.value.splice(index, 1)
  } else {
    selectedUserIds.value.push(userId)
  }
}

// Save user assignments
async function saveUserAssignments() {
  const companyId = currentCompany.value?.id

  if (!companyId || !props.roleId) {
    return
  }

  await put(
    `/v1/services/roles/${props.roleId}/users`,
    {
      userIds: selectedUserIds.value,
    },
    {
      params: { companyId },
      loader: loading,
    },
  )

  $q.notify({
    type: 'positive',
    message: 'User assignments updated successfully',
    position: 'top',
  })

  open.value = false
  emit('saved')
}

// Initialize when dialog opens
watch(
  open,
  (val) => {
    if (val) {
      // Set currently assigned users as selected
      selectedUserIds.value = props.assignedUsers.map((u) => u.id)
      fetchAllUsers()
    } else {
      // Reset when closed
      searchTerm.value = ''
    }
  },
  { immediate: true },
)
</script>

<template>
  <WDialog v-model="open" title="Assign Users to Role" minWidth="600px" persistent>
    <div class="tw:flex tw:flex-col tw:gap-4">
      <!-- Role Name -->
      <div class="tw:text-sm tw:text-secondary">
        {{ roleName }}
      </div>

      <!-- Search Bar -->
      <WInput v-model="searchTerm" placeholder="Search users by name or email..." dense outlined>
        <template #prepend>
          <WIcon icon="search" size="18px" class="tw:text-secondary" />
        </template>
      </WInput>

      <!-- User List -->
      <div
        class="tw:max-h-100 tw:overflow-y-auto custom-scrollbar tw:border tw:border-divider tw:rounded-lg"
      >
        <div v-if="loading" class="tw:flex tw:items-center tw:justify-center tw:py-12">
          <QSpinner color="primary" size="2em" />
        </div>

        <WEmptyState
          v-else-if="filteredUsers.length === 0"
          icon="person_off"
          title="No users found"
          compact
        />

        <div v-else class="tw:divide-y tw:divide-divider">
          <div
            v-for="user in filteredUsers"
            :key="user.id"
            class="tw:flex tw:items-center tw:px-4 tw:py-3 tw:hover:bg-sidebar/20 tw:transition-colors tw:cursor-pointer"
            @click="toggleUserSelection(user.id)"
          >
            <QCheckbox
              :modelValue="isUserSelected(user.id)"
              color="primary"
              class="tw:mr-3"
              @update:modelValue="toggleUserSelection(user.id)"
              @click.stop
            />
            <div class="tw:flex tw:flex-1 tw:gap-2">
              <UserAvatar :user="user" class="tw:size-10" />
              <div class="tw:flex-1">
                <div class="tw:font-semibold tw:text-on-sidebar">
                  {{ user.firstName }} {{ user.lastName }}
                </div>
                <div class="tw:text-sm tw:text-secondary">
                  {{ user.email }}
                </div>
              </div>
            </div>
            <div
              v-if="assignedUsers.some((u) => u.id === user.id)"
              class="tw:text-xs tw:px-2 tw:py-1 tw:rounded tw:bg-primary/10 tw:text-primary tw:font-semibold"
            >
              Currently Assigned
            </div>
          </div>
        </div>
      </div>

      <!-- Selection Counter -->
      <div class="tw:text-sm tw:text-secondary">
        {{ selectedUserIds.length }} user{{ selectedUserIds.length !== 1 ? 's' : '' }} selected
      </div>
    </div>

    <template #actions>
      <WBtn flat label="Cancel" color="primary" @click="open = false" />
      <WBtn
        v-if="canUpdateRole"
        label="Save Assignments"
        color="primary"
        unelevated
        :loading="loading"
        @click="saveUserAssignments"
      />
    </template>
  </WDialog>
</template>

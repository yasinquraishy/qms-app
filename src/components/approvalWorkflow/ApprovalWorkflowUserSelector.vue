<script setup>
import { currentCompany } from '@/utils/currentCompany.js'
import { get } from '@/api'

defineProps({
  canUpdate: { type: Boolean, default: false },
})

const reviewerIds = defineModel('reviewerIds', { type: Array, default: () => [] })

const users = ref([])
const loading = ref(false)
const searchQuery = ref('')

const filteredUsers = computed(() => {
  if (!searchQuery.value.trim()) return users.value
  const query = searchQuery.value.toLowerCase()
  return users.value.filter(
    (user) =>
      user.firstName?.toLowerCase().includes(query) ||
      user.lastName?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query),
  )
})

const selectedUsers = computed(() => {
  return users.value.filter((user) => reviewerIds.value.includes(user.id))
})

function getUserDisplayName(user) {
  const parts = [user.firstName, user.lastName].filter(Boolean)
  return parts.length > 0 ? parts.join(' ') : user.email
}

async function fetchUsers() {
  const companyId = currentCompany.value?.id
  if (!companyId) return

  try {
    const data = await get('/v1/services/users', {
      params: { companyId },
      loader: loading,
    })
    users.value = data.users || []
  } catch (err) {
    console.error('Error fetching users:', err)
    users.value = []
  }
}

function toggleUser(userId) {
  const index = reviewerIds.value.indexOf(userId)
  if (index === -1) {
    reviewerIds.value = [...reviewerIds.value, userId]
  } else {
    reviewerIds.value = reviewerIds.value.filter((id) => id !== userId)
  }
}

function removeUser(userId) {
  const index = reviewerIds.value.indexOf(userId)
  if (index !== -1) {
    reviewerIds.value = reviewerIds.value.filter((id) => id !== userId)
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<template>
  <div class="tw:space-y-4">
    <!-- Search -->
    <div>
      <label class="tw:block tw:text-xs tw:font-bold tw:text-secondary tw:uppercase tw:mb-2">
        Select Users
      </label>
      <WInput v-model="searchQuery" placeholder="Search users by name or email..." dense>
        <template #prepend>
          <WIcon icon="search" size="18px" class="tw:text-secondary" />
        </template>
      </WInput>
    </div>

    <!-- Selected Chips -->
    <div v-if="selectedUsers.length > 0" class="tw:flex tw:flex-wrap tw:gap-2">
      <div
        v-for="user in selectedUsers"
        :key="user.id"
        class="tw:flex tw:items-center tw:gap-2 tw:bg-main-hover tw:px-3 tw:py-1.5 tw:rounded-full tw:border tw:border-divider"
      >
        <span class="tw:text-xs tw:font-medium tw:text-on-main">
          {{ getUserDisplayName(user) }}
        </span>
        <button
          v-if="canUpdate"
          class="tw:text-secondary tw:hover:text-bad tw:transition-colors"
          @click="removeUser(user.id)"
        >
          <WIcon icon="close" size="14px" />
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="tw:flex tw:items-center tw:justify-center tw:py-4">
      <QSpinner color="primary" size="24px" />
    </div>

    <!-- User List -->
    <div v-else class="tw:max-h-48 tw:overflow-y-auto tw:space-y-1">
      <div
        v-for="user in filteredUsers"
        :key="user.id"
        class="tw:flex tw:items-center tw:gap-3 tw:p-2 tw:rounded-lg tw:transition-colors"
        :class="[
          reviewerIds.includes(user.id)
            ? 'tw:bg-primary/10 tw:border tw:border-primary/20'
            : 'tw:hover:bg-main-hover',
          canUpdate ? 'tw:cursor-pointer' : 'tw:cursor-default',
        ]"
        @click="canUpdate && toggleUser(user.id)"
      >
        <QCheckbox
          :modelValue="reviewerIds.includes(user.id)"
          color="primary"
          dense
          :disable="!canUpdate"
          @click.stop
          @update:modelValue="canUpdate && toggleUser(user.id)"
        />
        <div class="tw:flex-1 tw:min-w-0">
          <div class="tw:text-sm tw:font-medium tw:text-on-main">
            {{ getUserDisplayName(user) }}
          </div>
          <div class="tw:text-xs tw:text-secondary tw:truncate">{{ user.email }}</div>
        </div>
      </div>

      <div
        v-if="filteredUsers.length === 0 && !loading"
        class="tw:text-center tw:py-4 tw:text-sm tw:text-secondary"
      >
        No users found
      </div>
    </div>
  </div>
</template>

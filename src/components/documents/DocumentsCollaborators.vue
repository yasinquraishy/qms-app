<script setup>
import { currentCompany } from '@/utils/currentCompany.js'
import { get } from '@/api'

const props = defineProps({
  documentId: {
    type: String,
    required: true,
  },
  canEdit: {
    type: Boolean,
    default: false,
  },
})

const collaborators = defineModel('collaborators', { type: Array, default: () => [] })

const { updateDocument } = useDocuments()

const users = ref([])
const usersLoading = ref(false)
const userSearch = ref('')
const isUpdating = ref(false)

const collaboratorUserIds = computed(() => collaborators.value.map((c) => c.userId))

const filteredUsers = computed(() => {
  if (!userSearch.value.trim()) return users.value
  const q = userSearch.value.toLowerCase()
  return users.value.filter(
    (u) =>
      u.firstName?.toLowerCase().includes(q) ||
      u.lastName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q),
  )
})

async function fetchUsers() {
  const companyId = currentCompany.value?.id
  if (!companyId || users.value.length) return
  try {
    const data = await get('/v1/services/users', { params: { companyId }, loader: usersLoading })
    users.value = data.users || []
  } catch {
    users.value = []
  }
}

async function toggleCollaborator(userId) {
  if (isUpdating.value) return
  const currentIds = collaboratorUserIds.value
  const newIds = currentIds.includes(userId)
    ? currentIds.filter((id) => id !== userId)
    : [...currentIds, userId]

  isUpdating.value = true
  try {
    const result = await updateDocument(props.documentId, { collaboratorIds: newIds })
    if (!result.error) {
      collaborators.value = newIds.map((id) => ({
        userId: id,
        user: users.value.find((u) => u.id === id),
      }))
    }
  } finally {
    isUpdating.value = false
  }
}
</script>

<template>
  <div class="tw:pt-4 tw:border-t tw:border-divider">
    <div class="tw:flex tw:items-center tw:justify-between tw:mb-2">
      <label class="ds-label tw:block">Collaborators</label>
      <button
        v-if="canEdit"
        class="tw:flex tw:items-center tw:justify-center tw:w-6 tw:h-6 tw:rounded-md tw:hover:bg-sidebar-hover tw:text-secondary tw:transition-colors"
      >
        <WIcon name="add" size="14px" />
        <QMenu
          class="tw:w-72 tw:shadow-xl tw:border tw:border-divider tw:rounded-xl tw:overflow-hidden"
          @beforeShow="fetchUsers"
        >
          <div class="tw:p-3 tw:border-b tw:border-divider">
            <QInput
              v-model="userSearch"
              dense
              outlined
              placeholder="Search users..."
              hideBottomSpace
            >
              <template #prepend>
                <WIcon name="search" size="16px" class="tw:text-secondary" />
              </template>
            </QInput>
          </div>
          <QList class="tw:max-h-56 tw:overflow-y-auto tw:py-1">
            <div v-if="usersLoading" class="tw:flex tw:justify-center tw:py-4">
              <QSpinner color="primary" size="20px" />
            </div>
            <QItem
              v-for="user in filteredUsers"
              :key="user.id"
              v-ripple
              clickable
              dense
              class="tw:px-3 tw:py-1.5"
              @click.stop="toggleCollaborator(user.id)"
            >
              <QItemSection side>
                <QCheckbox
                  :modelValue="collaboratorUserIds.includes(user.id)"
                  dense
                  color="primary"
                  @update:modelValue="toggleCollaborator(user.id)"
                />
              </QItemSection>
              <QItemSection avatar>
                <UserAvatar :user="user" class="tw:size-7" />
              </QItemSection>
              <QItemSection>
                <QItemLabel class="tw:text-sm tw:font-medium">
                  {{ user.firstName }} {{ user.lastName }}
                </QItemLabel>
                <QItemLabel caption class="tw:text-xs tw:text-secondary">
                  {{ user.email }}
                </QItemLabel>
              </QItemSection>
            </QItem>
            <div
              v-if="!usersLoading && filteredUsers.length === 0"
              class="tw:text-center tw:py-4 tw:text-xs tw:text-secondary"
            >
              No users found
            </div>
          </QList>
        </QMenu>
      </button>
    </div>
    <div v-if="collaborators.length > 0" class="tw:flex tw:-space-x-2">
      <UserAvatar
        v-for="collab in collaborators"
        :key="collab.userId"
        :user="collab.user"
        class="tw:size-8"
      />
    </div>
    <p v-else class="tw:text-xs tw:text-secondary">No collaborators</p>
  </div>
</template>

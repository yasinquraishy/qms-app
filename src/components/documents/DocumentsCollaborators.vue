<script setup>
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

const userSearch = ref('')
const isUpdating = ref(false)

const allUsers = useLiveQuery(async (db) => db.User.where().exec(), { initial: [] })

const collaboratorRecords = useLiveQueryWithDeps(
  [() => props.documentId],
  async (db, [documentId]) => {
    const records = await db.UserOnDocument.where().exec()
    return records.filter((r) => r.documentId === documentId && !r.deletedAt)
  },
  { initial: [] },
)

const collaboratorUserIds = computed(() => collaboratorRecords.value.map((r) => r.userId))

const usersById = computed(() => {
  const map = {}
  for (const u of allUsers.value) map[u.id] = u
  return map
})

const collaborators = computed(() =>
  collaboratorRecords.value.map((r) => {
    r.user = usersById.value[r.userId]
    return r
  }),
)

const filteredUsers = computed(() => {
  if (!userSearch.value.trim()) return allUsers.value
  const q = userSearch.value.toLowerCase()
  return allUsers.value.filter(
    (u) =>
      u.firstName?.toLowerCase().includes(q) ||
      u.lastName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q),
  )
})

async function toggleCollaborator(userId) {
  if (isUpdating.value) return
  isUpdating.value = true
  try {
    const isCollaborator = collaboratorUserIds.value.includes(userId)
    if (isCollaborator) {
      const record = collaboratorRecords.value.find((r) => r.userId === userId)
      if (record) await record.delete()
    } else {
      const add = useLiveMutation(async (db) => {
        const record = db.UserOnDocument.create({ documentId: props.documentId, userId })
        await record.save()
        return record
      })

      await add()
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
            <div v-if="allUsers === undefined" class="tw:flex tw:justify-center tw:py-4">
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
            <BaseEmptyState
              v-if="allUsers !== undefined && filteredUsers.length === 0"
              dense
              title="No users found"
            />
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

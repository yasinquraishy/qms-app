<script setup>
import { IconSearch } from '@tabler/icons-vue'

const props = defineProps({
  stageId: { type: String, required: true },
  canUpdate: { type: Boolean, default: false },
})

const search = ref('')

const users = useLiveQuery((db) => db.User.where().exec(), { initial: [] })

const stageUsers = useLiveQueryWithDeps(
  [() => props.stageId],
  async (db, [stageId]) => {
    if (!stageId) return []
    return db.NcWorkflowTemplateStageUser.where('stageId', stageId).exec()
  },
  { initial: [] },
)

const assignedIds = computed(() => stageUsers.value.map((su) => su.userId))

const selectedUsers = computed(() => users.value.filter((u) => assignedIds.value.includes(u.id)))

const filteredUsers = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return users.value
  return users.value.filter(
    (u) =>
      u.firstName?.toLowerCase().includes(q) ||
      u.lastName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q),
  )
})

function getDisplayName(user) {
  const parts = [user.firstName, user.lastName].filter(Boolean)
  return parts.length > 0 ? parts.join(' ') : user.email
}

const createStageUser = useLiveMutation(async (db, { stageId, userId }) => {
  const su = db.NcWorkflowTemplateStageUser.create({ stageId, userId })
  await su.save()
})

async function toggleUser(userId) {
  if (!props.canUpdate) return
  const existing = stageUsers.value.find((su) => su.userId === userId)
  if (existing) {
    await existing.delete()
  } else {
    await createStageUser({ stageId: props.stageId, userId })
  }
}

async function removeUser(userId) {
  if (!props.canUpdate) return
  const existing = stageUsers.value.find((su) => su.userId === userId)
  if (existing) await existing.delete()
}
</script>

<template>
  <div class="tw:space-y-4">
    <!-- Search -->
    <div>
      <label class="tw:block tw:text-xs tw:font-bold tw:text-secondary tw:uppercase tw:mb-2">
        Select Users
      </label>
      <BaseTextInput v-model="search" placeholder="Search users by name or email...">
        <template #icon>
          <IconSearch :size="18" class="tw:text-secondary" />
        </template>
      </BaseTextInput>
    </div>

    <!-- Selected Chips -->
    <div v-if="selectedUsers.length > 0" class="tw:flex tw:flex-wrap tw:gap-2">
      <BaseChip
        v-for="user in selectedUsers"
        :key="user.id"
        :label="getDisplayName(user)"
        :removable="canUpdate"
        @remove="removeUser(user.id)"
      />
    </div>

    <!-- User List -->
    <div class="tw:max-h-48 tw:overflow-y-auto tw:space-y-1">
      <div
        v-for="user in filteredUsers"
        :key="user.id"
        class="tw:flex tw:items-center tw:gap-3 tw:p-2 tw:rounded-lg tw:transition-colors"
        :class="[
          assignedIds.includes(user.id)
            ? 'tw:bg-primary/10 tw:border tw:border-primary/20'
            : 'tw:hover:bg-main-hover',
          canUpdate ? 'tw:cursor-pointer' : 'tw:cursor-default',
        ]"
        @click="canUpdate && toggleUser(user.id)"
      >
        <BaseCheckbox
          :modelValue="assignedIds.includes(user.id)"
          :disabled="!canUpdate"
          @click.stop
          @update:modelValue="canUpdate && toggleUser(user.id)"
        />
        <div class="tw:flex-1 tw:min-w-0">
          <div class="tw:text-sm tw:font-medium tw:text-on-main">{{ getDisplayName(user) }}</div>
          <div class="tw:text-xs tw:text-secondary tw:truncate">{{ user.email }}</div>
        </div>
      </div>

      <BaseEmptyState v-if="filteredUsers.length === 0" dense title="No users found" />
    </div>
  </div>
</template>

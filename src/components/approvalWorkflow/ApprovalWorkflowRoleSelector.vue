<script setup>
import { IconSearch } from '@tabler/icons-vue'

const props = defineProps({
  stepId: { type: String, required: true },
  canUpdate: { type: Boolean, default: false },
})

const search = ref('')

const roles = useLiveQuery((db) => db.Role.where('statusId', 'ACTIVE').exec(), { initial: [] })

const stepRoles = useLiveQueryWithDeps(
  [() => props.stepId],
  async (db, [stepId]) => {
    if (!stepId) return []
    return await db.ApprovalWorkflowStepRole.where('stepId', stepId).exec()
  },
  { initial: [] },
)

const roleIds = computed(() => stepRoles.value.map((sr) => sr.roleId))
const selectedRoles = computed(() => roles.value.filter((role) => roleIds.value.includes(role.id)))
const filteredRoles = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return roles.value
  return roles.value.filter((r) => r.name.toLowerCase().includes(q))
})

const createStepRole = useLiveMutation(async (db, { stepId, roleId }) => {
  const sr = db.ApprovalWorkflowStepRole.create({ stepId, roleId })
  await sr.save()
})

async function toggleRole(roleId) {
  if (!props.canUpdate) return
  const existing = stepRoles.value.find((sr) => sr.roleId === roleId)
  if (existing) {
    await existing.delete()
  } else {
    await createStepRole({ stepId: props.stepId, roleId })
  }
}

async function removeRole(roleId) {
  if (!props.canUpdate) return
  const existing = stepRoles.value.find((sr) => sr.roleId === roleId)
  if (existing) await existing.delete()
}
</script>

<template>
  <div class="tw:space-y-4">
    <!-- Search -->
    <div>
      <label class="tw:block tw:text-xs tw:font-bold tw:text-secondary tw:uppercase tw:mb-2">
        Select Roles
      </label>
      <BaseTextInput v-model="search" placeholder="Search roles (e.g. Quality Manager...)">
        <template #icon>
          <IconSearch :size="18" class="tw:text-secondary" />
        </template>
      </BaseTextInput>
    </div>

    <!-- Selected Chips -->
    <div v-if="selectedRoles.length > 0" class="tw:flex tw:flex-wrap tw:gap-2">
      <BaseChip
        v-for="role in selectedRoles"
        :key="role.id"
        :label="role.name"
        :removable="canUpdate"
        @remove="removeRole(role.id)"
      />
    </div>

    <!-- Role List -->
    <div class="tw:max-h-48 tw:overflow-y-auto tw:space-y-1">
      <div
        v-for="role in filteredRoles"
        :key="role.id"
        class="tw:flex tw:items-center tw:gap-3 tw:p-2 tw:rounded-lg tw:transition-colors"
        :class="[
          roleIds.includes(role.id)
            ? 'tw:bg-primary/10 tw:border tw:border-primary/20'
            : 'tw:hover:bg-main-hover',
          canUpdate ? 'tw:cursor-pointer' : 'tw:cursor-default',
        ]"
        @click="canUpdate && toggleRole(role.id)"
      >
        <BaseCheckbox
          :modelValue="roleIds.includes(role.id)"
          :disabled="!canUpdate"
          @click.stop
          @update:modelValue="canUpdate && toggleRole(role.id)"
        />
        <div class="tw:flex-1 tw:min-w-0">
          <div class="tw:text-sm tw:font-medium tw:text-on-main">{{ role.name }}</div>
          <div v-if="role.description" class="tw:text-xs tw:text-secondary tw:truncate">
            {{ role.description }}
          </div>
        </div>
      </div>

      <div
        v-if="filteredRoles.length === 0"
        class="tw:text-center tw:py-4 tw:text-sm tw:text-secondary"
      >
        No roles found
      </div>
    </div>
  </div>
</template>

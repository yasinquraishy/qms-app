<script setup>
import { RadioGroup, RadioGroupOption } from '@headlessui/vue'

const props = defineProps({
  step: { type: Object, required: true },
  stepIndex: { type: Number, required: true },
  required: { type: Boolean, default: false },
})

// Current selection — live from IDB
const currentStepUser = useLiveQueryWithDeps(
  [() => props.step.id],
  async (db, [stepId]) => {
    if (!stepId) return null
    return db.WorkflowStepUser.where('stepId', stepId).first()
  },
  { initial: null },
)

const currentUserId = computed(() => currentStepUser.value?.userId ?? null)

// Step roles for this step
const stepRoles = useLiveQueryWithDeps(
  [() => props.step.id],
  async (db, [stepId]) => {
    if (!stepId) return []
    return db.WorkflowStepRole.where('stepId', stepId).exec()
  },
  { initial: [] },
)

// Candidate users derived from step roles → RoleOnUser → User
const candidateUsers = useLiveQueryWithDeps(
  [() => stepRoles.value.map((r) => r.roleId).join(',')],
  async (db, [roleIdsStr]) => {
    if (!roleIdsStr) return []
    const roleIds = roleIdsStr.split(',')
    const rolesOnUsers = await Promise.all(
      roleIds.map((id) => db.RoleOnUser.where('roleId', id).exec()),
    )
    const userIds = [...new Set(rolesOnUsers.flat().map((r) => r.userId))]
    const users = await Promise.all(userIds.map((id) => db.User.findByPk(id)))
    return users.filter(Boolean)
  },
  { initial: [] },
)

// Mutation: hard-delete all existing step users, then create one for the selected user
const selectUser = useLiveMutation(async (db, userId) => {
  const existing = await db.WorkflowStepUser.where('stepId', props.step.id).exec()
  await Promise.all(existing.map((su) => su.hardDelete()))
  if (userId) {
    const newSu = db.WorkflowStepUser.create({ stepId: props.step.id, userId })
    await newSu.save()
  }
})

// Auto-select the first available user when required and no selection exists
let autoSelectDone = false
watch(
  [candidateUsers, currentUserId],
  ([users, currentId]) => {
    if (!props.required || autoSelectDone) return
    if (currentId != null) {
      autoSelectDone = true
      return
    }
    if (!users.length) return
    autoSelectDone = true
    selectUser(users[0].id)
  },
  { immediate: true },
)

function getUserInitials(user) {
  return (user.firstName?.[0] ?? '') + (user.lastName?.[0] ?? '')
}

function getUserDisplayName(user) {
  const parts = [user.firstName, user.lastName].filter(Boolean)
  return parts.length > 0 ? parts.join(' ') : user.email
}
</script>

<template>
  <div class="tw:bg-white tw:border tw:border-divider tw:rounded-lg tw:p-4 tw:space-y-3">
    <!-- Step header -->
    <div class="tw:flex tw:items-center tw:gap-3">
      <div
        class="tw:w-6 tw:h-6 tw:rounded-full tw:flex tw:items-center tw:justify-center tw:text-xs tw:font-bold tw:shrink-0"
        :class="
          currentUserId ? 'tw:bg-primary tw:text-white' : 'tw:bg-main-hover tw:text-secondary'
        "
      >
        {{ stepIndex + 1 }}
      </div>
      <span class="tw:text-sm tw:font-semibold tw:text-on-main">
        {{ step.name }}
        <span v-if="required" class="tw:text-red-500">*</span>
      </span>
    </div>

    <!-- Empty state when no roles configured -->
    <div v-if="!stepRoles.length" class="tw:text-sm tw:text-secondary tw:italic tw:px-1">
      No roles configured for this step — no candidates available.
    </div>

    <!-- Empty state when roles exist but no users assigned to them -->
    <div
      v-else-if="stepRoles.length && !candidateUsers.length"
      class="tw:text-sm tw:text-secondary tw:italic tw:px-1"
    >
      No users are assigned to the roles for this step.
    </div>

    <!-- Radio group of candidate users -->
    <RadioGroup v-else :modelValue="currentUserId" @update:modelValue="selectUser">
      <div class="tw:space-y-2">
        <RadioGroupOption
          v-for="user in candidateUsers"
          :key="user.id"
          :value="user.id"
          v-slot="{ checked }"
          as="template"
        >
          <div
            class="tw:relative tw:flex tw:cursor-pointer tw:rounded-lg tw:px-4 tw:py-3 tw:border tw:transition-colors tw:select-none"
            :class="
              checked
                ? 'tw:border-primary tw:bg-primary/5'
                : 'tw:border-divider tw:hover:bg-main-hover'
            "
          >
            <div class="tw:flex tw:items-center tw:gap-3 tw:w-full">
              <!-- Avatar circle -->
              <div
                class="tw:w-8 tw:h-8 tw:rounded-full tw:flex tw:items-center tw:justify-center tw:text-xs tw:font-bold tw:text-white tw:shrink-0"
                :style="{ backgroundColor: user.color || '#2563eb' }"
              >
                {{ getUserInitials(user) || user.email?.[0]?.toUpperCase() }}
              </div>

              <!-- Name & email -->
              <div class="tw:flex-1 tw:min-w-0">
                <div class="tw:text-sm tw:font-medium tw:text-on-main">
                  {{ getUserDisplayName(user) }}
                </div>
                <div class="tw:text-xs tw:text-secondary tw:truncate">{{ user.email }}</div>
              </div>

              <!-- Selected indicator -->
              <div
                class="tw:w-5 tw:h-5 tw:rounded-full tw:border-2 tw:shrink-0 tw:flex tw:items-center tw:justify-center tw:transition-colors"
                :class="
                  checked ? 'tw:border-primary tw:bg-primary' : 'tw:border-divider tw:bg-white'
                "
              >
                <div v-show="checked" class="tw:w-2 tw:h-2 tw:rounded-full tw:bg-white" />
              </div>
            </div>
          </div>
        </RadioGroupOption>
      </div>
    </RadioGroup>

    <!-- Validation message -->
    <div
      v-if="required && !currentUserId && candidateUsers.length > 0"
      class="tw:text-xs tw:text-red-500"
    >
      Please select a reviewer for this step.
    </div>
  </div>
</template>

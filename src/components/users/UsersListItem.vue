<script setup>
import { getCompanyPath } from '@/utils/routeHelpers'

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
})

const router = useRouter()

// Map user.name to user.fullName for UserAvatar compatibility
const userForAvatar = computed(() => ({
  ...props.user,
  fullName: `${props.user.firstName} ${props.user.lastName}`,
}))

const roleNames = computed(() => {
  if (!props.user.roleAssignments || props.user.roleAssignments.length === 0) {
    return 'No roles assigned'
  }
  return props.user.roleAssignments.map((ra) => ra.role?.name || 'Unknown').join(', ')
})

function onClick() {
  router.push(getCompanyPath(`/users/${props.user.id}`))
}
</script>

<template>
  <WCard flat bordered class="tw:p-3 tw:cursor-pointer" @click="onClick">
    <div class="tw:flex tw:items-center tw:gap-3">
      <!-- Avatar -->
      <UserAvatar :user="userForAvatar" class="tw:size-14" />

      <!-- User Info -->
      <div class="tw:flex-1 tw:min-w-0">
        <div class="tw:text-lg tw:font-bold tw:text-on-main">
          {{ user.firstName }} {{ user.lastName }}
        </div>
        <div class="tw:text-sm tw:text-secondary">{{ user.email }}</div>
        <div class="tw:text-xs tw:text-secondary tw:mt-1">{{ roleNames }}</div>
      </div>

      <!-- Actions (Optional) -->
      <div class="tw:flex-none">
        <!-- Add actions here if needed, e.g., edit or delete -->
      </div>
    </div>
  </WCard>
</template>

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
  <div
    class="tw:flex tw:items-center tw:gap-3 tw:p-3 tw:bg-sidebar tw:rounded-lg tw:border tw:border-divider tw:cursor-pointer tw:hover:border-primary/30 tw:transition-colors"
    @click="onClick"
  >
    <UserAvatar :user="userForAvatar" class="tw:size-14" />

    <div class="tw:flex-1 tw:min-w-0">
      <div class="tw:text-lg tw:font-bold tw:text-on-main">
        {{ user.firstName }} {{ user.lastName }}
      </div>
      <div class="tw:text-sm tw:text-secondary">{{ user.email }}</div>
      <div class="tw:text-xs tw:text-secondary tw:mt-1">{{ roleNames }}</div>
    </div>

    <div class="tw:flex-none"></div>
  </div>
</template>

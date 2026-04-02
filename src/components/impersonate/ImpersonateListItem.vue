<script setup>
const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
})

const userForAvatar = computed(() => ({
  ...props.user,
  fullName: `${props.user.firstName} ${props.user.lastName}`,
}))

function onClick() {
  const returnUrl = window.location.pathname
  window.location.href = `/v1/auth/impersonate?id=${props.user.id}&returnUrl=${encodeURIComponent(returnUrl)}`
}
</script>

<template>
  <WCard
    flat
    bordered
    class="tw:p-3 tw:cursor-pointer tw:hover:bg-main-hover tw:transition-colors"
    @click="onClick"
  >
    <div class="tw:flex tw:items-center tw:gap-3">
      <UserAvatar :user="userForAvatar" class="tw:size-14" />

      <div class="tw:flex-1 tw:min-w-0">
        <div class="tw:text-lg tw:font-bold tw:text-on-main">
          {{ user.firstName }} {{ user.lastName }}
          <WStatusBadge v-if="user.isOwner" status="OWNER" />
        </div>
        <div class="tw:text-sm tw:text-secondary">{{ user.email }}</div>
        <div v-if="user.jobTitle" class="tw:text-xs tw:text-secondary tw:mt-1">
          {{ user.jobTitle }}
        </div>
      </div>
    </div>
  </WCard>
</template>

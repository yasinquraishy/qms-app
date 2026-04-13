<script setup>
defineProps({
  user: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <BaseBadge v-bind="$attrs">
    <template #icon>
      <UserAvatar :user="user" :showBadge="false" class="tw:size-5" :bordered="false" />
    </template>
    {{ user.firstName }} {{ user.lastName }}
  </BaseBadge>
</template>

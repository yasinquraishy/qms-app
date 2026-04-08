<script setup>
defineProps({
  user: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <div class="tw:max-w-fit tw:flex tw:items-center tw:px-2 tw:py-1 tw:rounded-md">
    <UserAvatar :user="user" :showBadge="false" class="tw:size-8" />
    <span class="tw:ml-1 tw:text-sm tw:font-medium tw:text-gray-700">
      {{ user.firstName }} {{ user.lastName }}
    </span>
  </div>
</template>

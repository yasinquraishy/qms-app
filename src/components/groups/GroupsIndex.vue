<script setup>
defineProps({
  id: {
    type: String,
    default: undefined,
  },
})
</script>

<template>
  <GroupPageId v-if="id" :id="id" />
  <GroupsHome v-else />
</template>

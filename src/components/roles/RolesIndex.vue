<script setup>
import { provideRoles } from '@/composables/useRoles.js'

const props = defineProps({
  id: {
    type: String,
    default: null,
  },
})

// Provide shared roles state for all child components
provideRoles()
</script>

<template>
  <RolePageId v-if="props.id" :id="props.id" />
  <RolesHome v-else />
</template>

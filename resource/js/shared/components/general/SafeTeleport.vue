<script setup>
defineProps({
  to: {
    type: String,
    required: true,
  },
})

const shouldTeleport = ref(false)

onMounted(() => {
  shouldTeleport.value = true
})
</script>

<template>
  <Teleport v-if="shouldTeleport" :to="to">
    <slot />
  </Teleport>
</template>

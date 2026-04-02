<script setup>
const isPrinting = ref(false)

useEventListener('beforeprint', () => {
  isPrinting.value = true
})

useEventListener('afterprint', () => {
  isPrinting.value = false
})
</script>

<template>
  <Teleport v-if="isPrinting" to="#print-portal">
    <slot />
  </Teleport>

  <slot v-else />
</template>

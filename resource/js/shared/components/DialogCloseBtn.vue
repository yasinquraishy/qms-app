<script setup>
const props = defineProps({
  icon: {
    type: String,
    default: 'sym_r_close',
  },
})
</script>

<template>
  <WBtn icon class="v-dialog-close-btn">
    <WIcon :name="props.icon" />
  </WBtn>
</template>

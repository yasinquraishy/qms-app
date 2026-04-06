<script setup>
defineOptions({
  inheritAttrs: false,
})

defineProps({
  icon: {
    type: String,
    default: undefined,
  },
  text: {
    type: String,
    default: undefined,
  },
})
</script>

<template>
  <WIcon
    color="primary"
    dark
    :icon="icon ?? 'tabler-info-circle'"
    class="cursor-pointer"
    size="22px"
  >
    <QTooltip maxWidth="24rem">
      {{ text }}
    </QTooltip>
  </WIcon>
</template>

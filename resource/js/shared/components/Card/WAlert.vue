<script setup>
import { ref } from 'vue'
defineProps({
  closable: {
    type: Boolean,
    default: false,
  },
})

const open = ref(true)

const close = () => {
  open.value = false
}
</script>

<template>
  <WCard v-if="open" class="w-alert row no-wrap items-start" flat>
    <span class="w-alert__underlay" />
    <QCardSection>
      <slot />
    </QCardSection>
    <div class="q-py-sm q-pr-sm">
      <WBtn
        v-if="closable"
        class="w-alert__close-btn"
        icon="sym_r_close"
        size="sm"
        color="currentColor"
        flat
        round
        @click="close"
      />
    </div>
  </WCard>
</template>

<style lang="scss" scoped>
.w-alert ::v-deep(*) {
  color: var(--q-primary);
}
.w-alert__underlay {
  position: absolute;
  border-radius: inherit;
  background: rgb(from var(--q-primary) r g b / 90%);
  inset: 0;
  opacity: 0.19;
}
</style>

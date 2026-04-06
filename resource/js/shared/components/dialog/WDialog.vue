<script setup>
defineProps({
  title: {
    type: String,
    default: undefined,
  },
  bodyClass: {
    type: [String, Array, Object],
    default: undefined,
  },
  minWidth: {
    type: String,
    default: '500px',
  },
  maxWidth: {
    type: String,
    default: undefined,
  },
  close: {
    type: Boolean,
    default: true,
  },
  tag: {
    type: String,
    default: 'div',
  },
})

const emit = defineEmits(['close', 'submit'])

const open = defineModel({
  type: Boolean,
  default: false,
})

function onClose() {
  open.value = false
  emit('close')
}
</script>

<template>
  <QDialog v-model="open" class="w-dialog" v-bind="$attrs">
    <WCard :tag="tag" :style="{ minWidth, maxWidth }" flat @submit.prevent>
      <WBtn v-if="close" icon="close" rounded class="w-dialog__close-btn" @click="onClose" />
      <QCardSection v-if="title || $slots.title" class="tw:text-lg tw:font-semibold">
        <slot name="title">
          {{ title }}
        </slot>
      </QCardSection>

      <QCardSection :class="bodyClass" class="tw:overflow-auto tw:pt-0!">
        <slot />
      </QCardSection>

      <QSeparator inset />

      <QCardSection v-if="$slots.actions" class="tw:flex tw:justify-end tw:items-center">
        <slot name="actions" />
      </QCardSection>
    </WCard>
  </QDialog>
</template>

<style lang="scss">
.w-dialog {
  .q-card {
    display: flex;
    overflow: visible;
    flex-direction: column;
    max-block-size: 90vh;

    .q-card__section {
      max-block-size: calc(100vh - 48px);
    }

    .q-card__section:last-child {
      overflow: visible;
    }
  }

  // Global table overflow fixes for all dialogs
  .q-table__container {
    overflow: auto;
    max-block-size: 80vh;
  }

  .q-table__bottom {
    position: sticky;
    z-index: 1;
    background: white;
    border-block-start: 1px solid #e0e0e0;
    inset-block-end: 0;
  }

  // Ensure all table content stays within dialog
  .q-table {
    overflow: hidden;
  }

  .w-dialog__close-btn {
    position: absolute;
    z-index: 1;
    inset-block-start: 0;
    inset-inline-end: 0;
    padding-block: 0.25rem !important;
    padding-inline: 0.65rem !important;
    transform: translate(0.8rem, -0.8rem);
    transition: transform 0.36s ease-in-out;

    &:hover {
      transform: translate(0.4rem, -0.4rem);
    }
  }
}
</style>

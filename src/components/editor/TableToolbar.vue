<script setup>
const props = defineProps({
  editor: {
    type: Object,
    required: true,
  },
})

const tableActions = [
  // Column actions
  {
    icon: 'arrow_back',
    action: 'addColumnBefore',
    label: 'Add column left',
    group: 'column',
  },
  {
    icon: 'arrow_forward',
    action: 'addColumnAfter',
    label: 'Add column right',
    group: 'column',
  },
  {
    icon: 'view_week',
    action: 'deleteColumn',
    label: 'Delete column',
    group: 'column',
    color: 'negative',
  },
  { divider: true },
  // Row actions
  {
    icon: 'arrow_upward',
    action: 'addRowBefore',
    label: 'Add row above',
    group: 'row',
  },
  {
    icon: 'arrow_downward',
    action: 'addRowAfter',
    label: 'Add row below',
    group: 'row',
  },
  {
    icon: 'table_rows',
    action: 'deleteRow',
    label: 'Delete row',
    group: 'row',
    color: 'negative',
  },
  { divider: true },
  // Cell actions
  {
    icon: 'merge',
    action: 'mergeCells',
    label: 'Merge cells',
    group: 'cell',
  },
  {
    icon: 'splitscreen',
    action: 'splitCell',
    label: 'Split cell',
    group: 'cell',
  },
  { divider: true },
  // Table action
  {
    icon: 'delete_forever',
    action: 'deleteTable',
    label: 'Delete table',
    group: 'table',
    color: 'negative',
  },
]

function executeCommand(action) {
  if (!props.editor) return

  props.editor.chain().focus()[action]().run()
}

function canExecute(action) {
  if (!props.editor) return false
  return props.editor.can()[action]()
}
</script>

<template>
  <div
    class="tw:flex tw:items-center tw:gap-1 tw:p-2 tw:bg-white tw:rounded-lg tw:shadow-lg tw:border tw:border-divider"
  >
    <template v-for="(item, index) in tableActions" :key="index">
      <!-- Divider -->
      <div v-if="item.divider" class="tw:w-px tw:h-6 tw:bg-divider tw:mx-1" />

      <!-- Action Button -->
      <WBtn
        v-else
        flat
        dense
        :disable="!canExecute(item.action)"
        class="tw:min-w-8! tw:min-h-8! tw:rounded! tw:transition-colors!"
        :class="
          !canExecute(item.action)
            ? 'tw:opacity-40! tw:cursor-not-allowed!'
            : item.color === 'negative'
              ? 'tw:text-negative! tw:hover:bg-negative/10!'
              : 'tw:text-secondary! tw:hover:bg-primary/10! tw:hover:text-primary!'
        "
        @click="executeCommand(item.action)"
      >
        <WIcon :icon="item.icon" size="18px" />
        <QTooltip
          anchor="top middle"
          self="bottom middle"
          :offset="[0, 8]"
          class="tw:bg-dark tw:text-white tw:text-xs tw:px-2 tw:py-1 tw:rounded"
        >
          {{ item.label }}
        </QTooltip>
      </WBtn>
    </template>
  </div>
</template>

<style lang="scss" scoped>
/* Ensure disabled styling */
:deep(.q-btn[disabled]) {
  opacity: 0.4 !important;
  cursor: not-allowed !important;
}
</style>

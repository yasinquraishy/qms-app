<script setup>
import {
  IconArrowLeft,
  IconArrowRight,
  IconColumns,
  IconArrowUp,
  IconArrowDown,
  IconLayoutRows,
  IconTablePlus,
  IconTableMinus,
  IconTrash,
} from '@tabler/icons-vue'

const props = defineProps({
  editor: {
    type: Object,
    required: true,
  },
})

const tableActions = [
  // Column actions
  {
    icon: IconArrowLeft,
    action: 'addColumnBefore',
    label: 'Add column left',
    group: 'column',
  },
  {
    icon: IconArrowRight,
    action: 'addColumnAfter',
    label: 'Add column right',
    group: 'column',
  },
  {
    icon: IconColumns,
    action: 'deleteColumn',
    label: 'Delete column',
    group: 'column',
    danger: true,
  },
  { divider: true },
  // Row actions
  {
    icon: IconArrowUp,
    action: 'addRowBefore',
    label: 'Add row above',
    group: 'row',
  },
  {
    icon: IconArrowDown,
    action: 'addRowAfter',
    label: 'Add row below',
    group: 'row',
  },
  {
    icon: IconLayoutRows,
    action: 'deleteRow',
    label: 'Delete row',
    group: 'row',
    danger: true,
  },
  { divider: true },
  // Cell actions
  {
    icon: IconTablePlus,
    action: 'mergeCells',
    label: 'Merge cells',
    group: 'cell',
  },
  {
    icon: IconTableMinus,
    action: 'splitCell',
    label: 'Split cell',
    group: 'cell',
  },
  { divider: true },
  // Table action
  {
    icon: IconTrash,
    action: 'deleteTable',
    label: 'Delete table',
    group: 'table',
    danger: true,
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
      <button
        v-else
        :disabled="!canExecute(item.action)"
        :title="item.label"
        class="tw:min-w-8 tw:min-h-8 tw:rounded tw:transition-colors tw:border-0 tw:flex tw:items-center tw:justify-center tw:p-1"
        :class="
          !canExecute(item.action)
            ? 'tw:opacity-40 tw:cursor-not-allowed tw:bg-transparent'
            : item.danger
              ? 'tw:text-red-600 tw:cursor-pointer tw:bg-transparent tw:hover:bg-red-50'
              : 'tw:text-secondary tw:cursor-pointer tw:bg-transparent tw:hover:bg-primary/10 tw:hover:text-primary'
        "
        @click="executeCommand(item.action)"
      >
        <component :is="item.icon" :size="18" />
      </button>
    </template>
  </div>
</template>

<script setup>
import { computed, shallowRef } from 'vue'

const props = defineProps({
  /** @type {import('vue').PropType<Array<{as?: string, id: string | number, name: string}>>} */
  items: {
    type: Array,
    default: () => [],
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
  nullLabel: {
    type: String,
    default: 'All',
  },
})

const selected = defineModel({
  type: [String, Number, Array, null],
})

const search = shallowRef('')

/**
 * Ensure we always work with an array in multiple mode
 */
function getArray() {
  return Array.isArray(selected.value) ? selected.value : []
}

const showNullable = computed(() => !props.required && !props.multiple)

const isNullableSelected = computed(() => {
  if (props.multiple) return getArray().length === 0
  return selected.value === null || selected.value === undefined
})

function toggleNullable(close) {
  if (props.multiple) {
    selected.value = []
  } else {
    selected.value = null
  }
  close()
}

const filtered = computed(() => {
  const query = search.value.toLowerCase()

  return props.items.filter((item) => item.name.toLowerCase().includes(query)).slice(0, 5)
})

function toggleSelection(id, close) {
  if (props.multiple) {
    const arr = getArray()

    if (arr.includes(id)) {
      // Prevent removing last item if required
      if (props.required && arr.length === 1) return
      selected.value = arr.filter((item) => item !== id)
    } else {
      selected.value = [...arr, id]
    }
  } else {
    // Prevent deselect if required
    if (props.required && selected.value === id) return
    selected.value = selected.value === id ? null : id
    close()
  }
}

function clear(id) {
  if (props.multiple) {
    const arr = getArray()

    if (!arr.includes(id)) return

    // Prevent clearing last item if required
    if (props.required && arr.length === 1) return

    selected.value = arr.filter((item) => item !== id)
  } else {
    if (props.required) return
    selected.value = null
  }
}

function isSelected(id) {
  if (props.multiple) {
    return getArray().includes(id)
  }
  return selected.value === id
}
</script>

<template>
  <BasePopover placement="bottom">
    <template #button>
      <BaseBadge v-if="showNullable && isNullableSelected" selectable>
        {{ nullLabel }}
      </BaseBadge>
      <slot v-else name="button" :selected="selected" :clear="clear" />
    </template>

    <template #content="{ close }">
      <!-- Search -->
      <div class="tw:p-1">
        <input
          v-model="search"
          type="text"
          placeholder="Search..."
          class="tw:w-full tw:px-2 tw:py-1 tw:mb-2 tw:border tw:border-divider tw:rounded-md tw:focus:ring-1 tw:focus:ring-primary tw:focus:outline-none tw:bg-sidebar tw:text-sm"
        />
      </div>

      <!-- Items -->
      <slot name="items" :close="close">
        <div class="tw:flex tw:flex-col tw:space-y-0.5">
          <!-- Nullable "All" item -->
          <button
            v-if="showNullable"
            :class="[
              isNullableSelected
                ? 'tw:bg-primary/20 tw:text-primary'
                : 'tw:text-on-sidebar tw:hover:bg-primary/10',
              'tw:group tw:w-full tw:text-left tw:px-2 tw:py-2 tw:text-sm tw:transition-colors',
            ]"
            @click="toggleNullable(close)"
          >
            {{ nullLabel }}
          </button>

          <button
            v-for="item in filtered"
            :key="item.id"
            :class="[
              isSelected(item.id)
                ? 'tw:bg-primary/20 tw:text-primary'
                : 'tw:text-on-sidebar tw:hover:bg-primary/10',
              'tw:group tw:w-full tw:text-left tw:px-2 tw:py-2 tw:text-sm  tw:transition-colors',
            ]"
            @click="toggleSelection(item.id, close)"
          >
            {{ item.name }}
          </button>
        </div>
      </slot>
    </template>
  </BasePopover>
</template>

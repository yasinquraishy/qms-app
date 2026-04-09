<script setup>
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
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

function toggleNullable() {
  if (props.multiple) {
    selected.value = []
  } else {
    selected.value = null
  }
}

const filtered = computed(() => {
  const query = search.value.toLowerCase()

  return props.items.filter((item) => item.name.toLowerCase().includes(query)).slice(0, 5)
})

function toggleSelection(id) {
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
  <Menu as="div" class="tw:relative tw:inline-block tw:text-left">
    <div>
      <MenuButton>
        <BaseBadge v-if="showNullable && isNullableSelected" selectable>
          {{ nullLabel }}
        </BaseBadge>
        <slot v-else name="button" :selected="selected" :clear="clear" />
      </MenuButton>
    </div>

    <transition
      enterActiveClass="transition duration-100 ease-out"
      enterFromClass="transform scale-95 opacity-0"
      enterToClass="transform scale-100 opacity-100"
      leaveActiveClass="transition duration-75 ease-in"
      leaveFromClass="transform scale-100 opacity-100"
      leaveToClass="transform scale-95 opacity-0"
    >
      <MenuItems
        class="tw:absolute tw:z-10 tw:right-0 tw:mt-2 tw:w-56 tw:origin-top-right tw:rounded-md tw:bg-sidebar tw:shadow-lg tw:ring-1 tw:ring-divider/5 tw:focus:outline-none tw:overflow-hidden"
      >
        <!-- Search -->
        <div class="tw:p-1">
          <input
            v-model="search"
            type="text"
            placeholder="Search..."
            class="tw:w-full tw:px-2 tw:py-1 tw:mb-2 tw:border tw:border-divider tw:rounded-md focus:tw:ring-1 focus:tw:ring-primary focus:tw:outline-none tw:bg-sidebar tw:text-sm"
          />
        </div>

        <!-- Items -->
        <slot name="items">
          <!-- Nullable "All" item -->
          <MenuItem v-if="showNullable" v-slot="{ active }">
            <button
              :class="[
                active
                  ? 'tw:bg-primary/10 tw:text-primary'
                  : isNullableSelected
                    ? 'tw:bg-primary/20 tw:text-primary'
                    : 'tw:text-on-sidebar',
                'tw:group tw:flex tw:w-full tw:items-center tw:px-2 tw:py-2 tw:text-sm',
              ]"
              @click="toggleNullable"
            >
              {{ nullLabel }}
            </button>
          </MenuItem>

          <MenuItem v-for="item in filtered" :key="item.id" v-slot="{ active }">
            <component
              :is="item.as || 'button'"
              :class="[
                active
                  ? 'tw:bg-primary/10 tw:text-primary'
                  : isSelected(item.id)
                    ? 'tw:bg-primary/20 tw:text-primary'
                    : 'tw:text-on-sidebar',
                'tw:group tw:flex tw:w-full tw:items-center tw:px-2 tw:py-2 tw:text-sm',
              ]"
              @click="toggleSelection(item.id)"
            >
              {{ item.name }}
            </component>
          </MenuItem>
        </slot>
      </MenuItems>
    </transition>
  </Menu>
</template>

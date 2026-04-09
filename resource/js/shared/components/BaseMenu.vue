<script setup>
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { IconDotsVertical } from '@tabler/icons-vue'

defineProps({
  /** @type {import('vue').PropType<Array<{as?: string, name: string, click: () => {}}>>} */
  items: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <Menu as="div" class="tw:relative tw:inline-block tw:text-left">
    <MenuButton as="template">
      <slot name="trigger">
        <button
          class="tw:flex tw:items-center tw:justify-center tw:rounded-md tw:p-1 tw:text-secondary tw:hover:bg-sidebar-hover tw:hover:text-on-sidebar tw:transition-colors tw:duration-150"
        >
          <IconDotsVertical :size="16" />
        </button>
      </slot>
    </MenuButton>

    <transition
      enterActiveClass="transition duration-100 ease-out"
      enterFromClass="transform scale-95 opacity-0"
      enterToClass="transform scale-100 opacity-100"
      leaveActiveClass="transition duration-75 ease-in"
      leaveFromClass="transform scale-100 opacity-100"
      leaveToClass="transform scale-95 opacity-0"
    >
      <MenuItems
        class="tw:absolute tw:z-10 tw:right-0 tw:mt-1 tw:w-48 tw:origin-top-right tw:rounded-md tw:bg-sidebar tw:shadow-lg tw:ring-1 tw:ring-divider/5 tw:focus:outline-none tw:overflow-hidden tw:py-1"
      >
        <slot>
          <MenuItem v-for="item in items" :key="item.name" v-slot="{ active }">
            <component
              :is="item.as || 'button'"
              :class="[
                active ? 'tw:bg-main-hover tw:text-on-main' : 'tw:text-on-sidebar',
                'tw:group tw:flex tw:w-full tw:items-center tw:gap-2 tw:px-3 tw:py-2 tw:text-sm tw:transition-colors tw:duration-100',
              ]"
              @click="item.click"
            >
              <component
                :is="item.icon"
                v-if="item.icon"
                :size="15"
                class="tw:shrink-0 tw:text-secondary group-hover:tw:text-on-main"
              />
              {{ item.name }}
            </component>
          </MenuItem>
        </slot>
      </MenuItems>
    </transition>
  </Menu>
</template>

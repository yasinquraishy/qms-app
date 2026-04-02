<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  command: {
    type: Function,
    required: true,
  },
})

const selectedIndex = ref(0)

watch(
  () => props.items,
  () => {
    selectedIndex.value = 0
  },
)

function onKeyDown({ event }) {
  if (event.key === 'ArrowUp') {
    upHandler()
    return true
  }

  if (event.key === 'ArrowDown') {
    downHandler()
    return true
  }

  if (event.key === 'Enter') {
    enterHandler()
    return true
  }

  return false
}

function upHandler() {
  selectedIndex.value = (selectedIndex.value + props.items.length - 1) % props.items.length
}

function downHandler() {
  selectedIndex.value = (selectedIndex.value + 1) % props.items.length
}

function enterHandler() {
  selectItem(selectedIndex.value)
}

function selectItem(index) {
  const item = props.items[index]

  if (item) {
    props.command(item)
  }
}

defineExpose({ onKeyDown })
</script>

<template>
  <div class="dropdown-menu elevation-24">
    <template v-if="items.length">
      <button
        v-for="(item, index) in items"
        :key="index"
        :class="{ 'is-selected': index === selectedIndex }"
        class="cursor-pointer bg-secondary"
        type="button"
        @click="selectItem(index)"
      >
        {{ item.label || item.id }}
      </button>
    </template>
  </div>
</template>

<style lang="scss">
/* Dropdown menu */
.dropdown-menu {
  background: white;
  border: 1px solid #ccc;
  border-radius: 0.7rem;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  overflow: auto;
  padding: 0.4rem;
  position: relative;

  button {
    align-items: center;
    background-color: transparent;
    display: flex;
    gap: 0.25rem;

    &:hover,
    &:hover.is-selected {
      background-color: #f1f1f1;
    }

    &.is-selected {
      background-color: #e0e0e0;
    }
  }

  button,
  .item {
    text-align: left;
    width: 100%;
    border-radius: 0.5rem;
    border: none;
    color: inherit;
    font-family: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    line-height: 1.15;
    margin: 0;
    padding: 0.375rem 0.625rem;
    transition: all 0.2s cubic-bezier(0.65, 0.05, 0.36, 1);
  }
}
</style>

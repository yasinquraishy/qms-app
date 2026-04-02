<script setup>
defineProps({
  items: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <div class="tw:flex tw:items-center tw:flex-nowrap tw:gap-1 tw:text-nowrap">
    <template v-for="(item, index) in items" :key="`${item.label}-${index}`">
      <component
        :is="item.to && index < items.length - 1 ? 'RouterLink' : 'span'"
        :to="item.to"
        :class="
          index < items.length - 1 ? 'tw:text-on-main tw:hover:text-primary!' : 'tw:font-semibold'
        "
      >
        {{ item.label }}
      </component>
      <span
        v-if="index < items.length - 1"
        class="material-symbols-outlined tw:text-gray-400 tw:text-lg"
      >
        chevron_right
      </span>
    </template>
  </div>
</template>

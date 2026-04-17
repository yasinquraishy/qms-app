<script setup>
defineProps({
  product: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <BaseBadge v-bind="$attrs">
    {{ product.name }}
    <span class="tw:text-xs tw:opacity-60">{{ product.sku }}</span>
  </BaseBadge>
</template>

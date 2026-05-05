<script setup>
defineProps({
  saving: { type: Boolean, default: false },
  error: { type: String, default: null },
})
</script>

<template>
  <div class="tw:text-xs">
    <span v-if="saving" class="tw:text-secondary">Saving…</span>
    <span v-else-if="error" class="tw:text-red-600" :title="error">Save failed</span>
  </div>
</template>

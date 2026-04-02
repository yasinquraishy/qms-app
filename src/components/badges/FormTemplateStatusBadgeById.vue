<script setup>
import FormTemplateStatusBadge from './FormTemplateStatusBadge.vue'

const props = defineProps({
  statusId: {
    type: String,
    required: true,
  },
  showDot: {
    type: Boolean,
    default: true,
  },
})

const status = computed(() => ({
  id: props.statusId,
}))
</script>

<template>
  <FormTemplateStatusBadge :status="status" :showDot="showDot" />
</template>

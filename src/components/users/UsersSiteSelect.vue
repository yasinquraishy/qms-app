<script setup>
defineProps({
  required: {
    type: Boolean,
    default: true,
  },
  multiple: {
    type: Boolean,
    default: false,
  },
})

const siteId = defineModel({
  type: [String, Array, null],
  default: null,
})
</script>

<template>
  <SiteSelectMenu
    v-model="siteId"
    :required="required"
    :multiple="multiple"
    v-bind="$attrs"
  >
    <template v-if="$slots.label" #label>
      <slot name="label" />
    </template>
  </SiteSelectMenu>
</template>

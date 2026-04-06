<script setup>
const props = defineProps({
  status: { type: String, default: '' },
  showDot: { type: Boolean, default: false },
  hideLabel: { type: Boolean, default: false },
})

const statusConfig = {
  DRAFT: { label: 'Draft', color: 'slate', class: 'tw:text-slate-600 tw:bg-slate-50' },
  PUBLISHED: {
    label: 'Published',
    color: 'emerald',
    class: 'tw:text-emerald-600 tw:bg-emerald-50',
  },
  RETIRED: { label: 'Retired', color: 'orange', class: 'tw:text-orange-600 tw:bg-orange-50' },
  ARCHIVED: { label: 'Archived', color: 'zinc', class: 'tw:text-zinc-600 tw:bg-zinc-50' },
}

const config = computed(() => {
  return statusConfig[props.status] || statusConfig.DRAFT
})
</script>

<template>
  <span
    class="tw:text-xs tw:font-medium"
    :class="[config.class, showDot && hideLabel ? 'tw:rounded-full' : 'tw:rounded tw:px-2 tw:py-1']"
  >
    <template v-if="showDot">
      <span
        class="tw:inline-block tw:size-2 tw:rounded-full tw:mr-1"
        :class="{
          'tw:bg-slate-500': config.color === 'slate',
          'tw:bg-emerald-500': config.color === 'emerald',
          'tw:bg-orange-500': config.color === 'orange',
          'tw:bg-zinc-500': config.color === 'zinc',
        }"
      ></span>
    </template>

    <template v-if="!hideLabel">{{ config.label }}</template>
  </span>
</template>

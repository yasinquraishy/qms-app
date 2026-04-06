<script setup>
defineProps({
  workflow: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <div
    class="tw:bg-sidebar tw:border tw:border-divider tw:rounded-xl tw:p-4 tw:cursor-pointer tw:transition-all tw:duration-200 tw:hover:border-primary tw:hover:shadow-md"
  >
    <div class="tw:flex tw:items-center tw:justify-between tw:mb-2">
      <div class="tw:flex tw:items-center tw:gap-3">
        <div
          class="tw:w-10 tw:h-10 tw:bg-primary/10 tw:text-primary tw:rounded-xl tw:flex tw:items-center tw:justify-center"
        >
          <WIcon icon="account_tree" size="22px" />
        </div>
        <div>
          <div class="tw:font-bold tw:text-on-main">{{ workflow.name }}</div>
          <div class="tw:text-xs tw:text-secondary tw:font-mono">{{ workflow.code }}</div>
        </div>
      </div>
      <WStatusBadge :status="workflow.statusId" variant="workflow" showDot />
    </div>

    <div v-if="workflow.description" class="tw:text-sm tw:text-secondary tw:mb-3 tw:line-clamp-2">
      {{ workflow.description }}
    </div>

    <div class="tw:flex tw:items-center tw:gap-4 tw:text-xs tw:text-secondary">
      <span class="tw:flex tw:items-center tw:gap-1">
        <WIcon icon="layers" size="16px" />
        {{ workflow.steps?.length || 0 }} Steps
      </span>
      <span class="tw:flex tw:items-center tw:gap-1">
        <WIcon icon="history" size="16px" />
        v{{ workflow.version }}
      </span>
      <span class="tw:flex tw:items-center tw:gap-1">
        <WIcon icon="calendar_today" size="16px" />
        {{ workflow.createdAt.formatDate('date') }}
      </span>
    </div>
  </div>
</template>

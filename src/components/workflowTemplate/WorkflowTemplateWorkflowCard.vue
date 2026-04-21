<script setup>
import { IconLayoutKanban, IconCalendar } from '@tabler/icons-vue'
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
          <IconLayoutKanban :size="22" />
        </div>
        <div>
          <div class="tw:font-bold tw:text-on-main">{{ workflow.name }}</div>
        </div>
      </div>
      <WorkflowTemplateVersionStatusBadgeById :statusId="workflow.statusId" />
    </div>

    <div v-if="workflow.description" class="tw:text-sm tw:text-secondary tw:mb-3 tw:line-clamp-2">
      {{ workflow.description }}
    </div>

    <div class="tw:flex tw:items-center tw:gap-4 tw:text-xs tw:text-secondary">
      <span class="tw:flex tw:items-center tw:gap-1">
        <IconCalendar :size="16" />
        {{ workflow.createdAt?.toFormat ? workflow.createdAt.toFormat('dd MMM yyyy') : '' }}
      </span>
    </div>
  </div>
</template>

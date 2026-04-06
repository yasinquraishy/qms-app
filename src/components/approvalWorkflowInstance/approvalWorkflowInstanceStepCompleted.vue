<script setup>
defineProps({
  stepEntry: { type: Object, required: true },
})
</script>

<template>
  <div
    class="tw:bg-sidebar tw:rounded-xl tw:border tw:border-divider tw:p-5 tw:shadow-sm tw:opacity-80 tw:hover:opacity-100 tw:transition-opacity"
  >
    <div class="tw:flex tw:items-center tw:justify-between tw:mb-4">
      <div>
        <h3 class="tw:font-bold tw:text-on-main">
          Step {{ stepEntry.stepNumber }}: {{ stepEntry.step?.name }}
        </h3>
        <p class="tw:text-xs tw:text-secondary">
          Rule: {{ stepEntry.step?.approvalRule }} &bull; Threshold met
        </p>
      </div>
      <WStatusBadge :status="stepEntry.statusId" variant="step" />
    </div>
    <div class="tw:space-y-2">
      <div v-for="task in stepEntry.tasks" :key="task.id" class="tw:flex tw:items-center tw:gap-3">
        <UserAvatar :user="task.assignee" class="tw:size-8" />
        <div>
          <p class="tw:text-sm tw:font-semibold tw:text-on-main">
            {{ task.assignee?.firstName }} {{ task.assignee?.lastName }}
          </p>
          <WStatusBadge :status="task.statusId" variant="task" />
        </div>
      </div>
    </div>
  </div>
</template>

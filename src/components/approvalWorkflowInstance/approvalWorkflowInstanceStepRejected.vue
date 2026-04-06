<script setup>
defineProps({
  stepEntry: { type: Object, required: true },
})
</script>

<template>
  <div class="tw:bg-sidebar tw:rounded-xl tw:border tw:border-red-200 tw:p-5 tw:shadow-sm">
    <div class="tw:flex tw:items-center tw:justify-between">
      <div>
        <h3 class="tw:font-bold tw:text-on-main">
          Step {{ stepEntry.stepNumber }}: {{ stepEntry.step?.name }}
        </h3>
        <p class="tw:text-xs tw:text-secondary">Rule: {{ stepEntry.step?.approvalRule }}</p>
      </div>
      <WStatusBadge :status="stepEntry.statusId" variant="step" />
    </div>
  </div>
</template>

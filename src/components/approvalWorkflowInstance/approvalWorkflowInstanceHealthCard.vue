<script setup>
defineProps({
  progressPercent: { type: Number, default: 0 },
  elapsedTime: { type: String, default: 'N/A' },
  completedSteps: { type: Number, default: 0 },
  totalSteps: { type: Number, default: 0 },
})
</script>

<template>
  <div class="tw:bg-primary/5 tw:rounded-xl tw:border tw:border-primary/10 tw:p-5">
    <h4 class="ds-label tw:text-primary tw:mb-4">Instance Health</h4>
    <div class="tw:space-y-4">
      <div>
        <div class="tw:flex tw:justify-between tw:text-xs tw:mb-1.5">
          <span class="tw:text-secondary tw:font-medium">Overall Progress</span>
          <span class="tw:text-primary tw:font-bold">{{ progressPercent }}%</span>
        </div>
        <div class="tw:w-full tw:bg-slate-200 tw:h-2 tw:rounded-full tw:overflow-hidden">
          <div
            class="tw:bg-primary tw:h-full tw:rounded-full tw:transition-all tw:duration-500"
            :style="{ width: `${progressPercent}%` }"
          ></div>
        </div>
      </div>
      <div class="tw:grid tw:grid-cols-2 tw:gap-4 tw:pt-2">
        <div class="tw:bg-sidebar tw:p-3 tw:rounded-lg tw:border tw:border-divider">
          <p class="ds-label-sm tw:text-secondary">Elapsed</p>
          <p class="tw:text-sm tw:font-bold tw:text-on-main">{{ elapsedTime }}</p>
        </div>
        <div class="tw:bg-sidebar tw:p-3 tw:rounded-lg tw:border tw:border-divider">
          <p class="ds-label-sm tw:text-secondary">Steps</p>
          <p class="tw:text-sm tw:font-bold tw:text-on-main">
            {{ completedSteps }} / {{ totalSteps }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

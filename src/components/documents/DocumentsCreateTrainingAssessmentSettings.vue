<script setup>
const form = defineModel({
  type: Object,
  default: () => ({
    passingScore: 80,
    requiredCompletion: true,
    assessmentDueDate: null,
    retryLimit: '3 attempts',
  }),
})
</script>

<template>
  <!-- Sidebar Controls -->
  <aside class="tw:w-full tw:lg:w-80 tw:space-y-6">
    <div
      class="tw:bg-sidebar tw:rounded-xl tw:border tw:border-divider tw:shadow-sm tw:p-6 tw:sticky tw:top-24"
    >
      <h3
        class="tw:text-lg tw:font-bold tw:text-on-sidebar tw:mb-6 tw:flex tw:items-center tw:gap-2"
      >
        <WIcon name="settings" class="tw:text-primary" />
        Assessment Settings
      </h3>
      <div class="tw:space-y-6">
        <WInput v-model="form.passingScore" label="Passing Score" type="number">
          <template #append>
            <span class="tw:text-sm tw:text-secondary tw:font-medium">%</span>
          </template>
        </WInput>

        <div class="tw:flex tw:items-center tw:justify-between">
          <div>
            <label class="tw:text-sm tw:font-medium tw:text-on-sidebar">Required Completion</label>
            <p class="tw:text-[11px] tw:text-secondary">Must pass before signing</p>
          </div>
          <label class="tw:relative tw:inline-flex tw:items-center tw:cursor-pointer">
            <QToggle v-model="form.requiredCompletion" color="primary" keepColor />
          </label>
        </div>
        <div class="tw:space-y-2">
          <WDateTimeInput
            v-model="form.assessmentDueDate"
            label="Assessment Due Date"
            mode="date"
          />
        </div>
        <div class="tw:space-y-2">
          <WSelect
            v-model="form.retryLimit"
            label="Retry limit"
            :options="['3 attempts', '5 attempts', 'Unlimited']"
          />
        </div>
      </div>
      <div class="tw:mt-8 tw:pt-6 tw:border-t tw:border-divider">
        <div
          class="tw:flex tw:items-center tw:gap-2 tw:text-primary tw:bg-primary/20 tw:p-3 tw:rounded-lg"
        >
          <span class="material-symbols-outlined tw:text-xl">info</span>
          <p class="tw:text-[12px] tw:leading-tight tw:font-medium">
            Changes here will apply to all current trainees of this version.
          </p>
        </div>
      </div>
    </div>
  </aside>
</template>

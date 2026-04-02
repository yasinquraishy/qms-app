<script setup>
defineProps({
  stepEntry: { type: Object, required: true },
})
</script>

<template>
  <div
    class="tw:bg-sidebar tw:rounded-xl tw:border tw:border-dashed tw:border-divider tw:p-5"
    :class="{ 'tw:opacity-60': !stepEntry.reviewers }"
  >
    <div class="tw:flex tw:items-center tw:justify-between">
      <div>
        <h3 class="tw:font-bold tw:text-secondary">
          Step {{ stepEntry.stepNumber }}: {{ stepEntry.step?.name }}
        </h3>
        <p class="tw:text-xs tw:text-secondary tw:italic">
          Rule: {{ stepEntry.step?.approvalRule }} &bull;
          {{
            stepEntry.step?.approvalRule === 'ANY'
              ? 'First approval completes step'
              : 'All approvers must sign'
          }}
        </p>
      </div>

      <!-- Avatar stack -->
      <div v-if="stepEntry.reviewers" class="tw:flex tw:-space-x-3 tw:overflow-hidden tw:my-4">
        <UserAvatar
          v-for="reviewer in stepEntry.reviewers"
          :key="reviewer.id"
          :user="reviewer.user"
          class="tw:size-8 tw:border-divider tw:grayscale tw:opacity-50"
        />
      </div>
      <WStatusBadge v-else :status="stepEntry.statusId" variant="step" />
    </div>

    <template v-if="stepEntry.reviewers">
      <!-- Reviewer list -->
      <div class="tw:space-y-3">
        <div
          v-for="reviewer in stepEntry.reviewers"
          :key="reviewer.id"
          class="tw:flex tw:items-center tw:gap-3 tw:p-3 tw:rounded-lg tw:border tw:bg-sidebar tw:border-divider tw:opacity-60"
        >
          <UserAvatar
            :user="reviewer"
            class="tw:size-10 tw:border-divider tw:grayscale tw:opacity-50"
          />
          <div>
            <p class="tw:text-sm tw:font-semibold tw:text-on-main">
              {{ reviewer.user.firstName }} {{ reviewer.user.lastName }}
            </p>
            <p class="ds-label-sm tw:text-secondary">
              {{ reviewer.user.email }}
            </p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

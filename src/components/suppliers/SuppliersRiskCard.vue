<script setup>
const props = defineProps({
  supplier: {
    type: Object,
    required: true,
  },
})

const riskConfig = {
  Low: {
    bg: 'tw:bg-blue-50',
    text: 'tw:text-blue-700',
    dot: 'tw:bg-blue-500',
    border: 'tw:border-blue-100',
  },
  Medium: {
    bg: 'tw:bg-amber-50',
    text: 'tw:text-amber-700',
    dot: 'tw:bg-amber-500',
    border: 'tw:border-amber-100',
  },
  High: {
    bg: 'tw:bg-red-50',
    text: 'tw:text-red-700',
    dot: 'tw:bg-red-500',
    border: 'tw:border-red-100',
  },
}

const currentRisk = computed(() => riskConfig[props.supplier.riskLevel] || riskConfig.Low)
</script>

<template>
  <div
    class="tw:bg-sidebar tw:rounded-xl tw:shadow-sm tw:border tw:border-divider tw:overflow-hidden tw:flex tw:flex-col tw:justify-between"
  >
    <div>
      <div
        class="tw:px-6 tw:py-4 tw:border-b tw:border-divider tw:bg-main-hover tw:flex tw:items-center tw:gap-3"
      >
        <div
          class="tw:w-10 tw:h-10 tw:rounded-lg tw:bg-sky-100 tw:flex tw:items-center tw:justify-center"
        >
          <QIcon name="verified_user" class="tw:text-sky-600" size="sm" />
        </div>
        <h3 class="tw:text-lg tw:font-bold tw:text-on-main">Risk Profile</h3>
      </div>
      <div class="tw:p-6 tw:space-y-6">
        <div>
          <label class="ds-label-sm tw:text-secondary tw:block tw:mb-2">Current Risk Level</label>
          <div
            v-if="supplier.riskLevel"
            class="tw:inline-flex tw:items-center tw:gap-2 tw:px-4 tw:py-2 tw:rounded-lg tw:font-bold tw:text-sm tw:border"
            :class="[currentRisk.bg, currentRisk.text, currentRisk.border]"
          >
            <span class="tw:w-2 tw:h-2 tw:rounded-full" :class="currentRisk.dot"></span>
            {{ supplier.riskLevel }} Risk
          </div>
          <p v-else class="tw:text-sm tw:text-secondary">Not assessed</p>
        </div>
        <div>
          <label class="ds-label-sm tw:text-secondary tw:block tw:mb-1">Last Assessment</label>
          <p class="tw:text-sm tw:font-medium tw:text-on-main">
            {{ supplier.lastEvaluationDate?.formatDate('date') || 'Not evaluated' }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  total: {
    type: Number,
    default: 0,
  },
  active: {
    type: Number,
    default: 0,
  },
  withTraining: {
    type: Number,
    default: 0,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <div class="tw:grid tw:grid-cols-2 tw:md:grid-cols-3 tw:gap-3">
    <!-- Total Card -->
    <WCard flat class="tw:p-4">
      <div class="tw:flex tw:items-center tw:gap-3">
        <div class="tw:bg-primary/10 tw:rounded-lg tw:p-2">
          <WIcon name="folder" size="24px" class="tw:text-primary" />
        </div>
        <div>
          <div class="tw:text-2xl tw:font-bold tw:text-on-sidebar">{{ total }}</div>
          <div class="tw:text-xs tw:text-secondary">Total Templates</div>
        </div>
      </div>
    </WCard>

    <!-- Active Card -->
    <WCard flat class="tw:p-4">
      <div class="tw:flex tw:items-center tw:gap-3">
        <div class="tw:bg-main-hover tw:rounded-lg tw:p-2">
          <WIcon name="check_circle" size="24px" class="tw:text-green-600" />
        </div>
        <div>
          <div class="tw:text-2xl tw:font-bold tw:text-on-sidebar">{{ active }}</div>
          <div class="tw:text-xs tw:text-secondary">Active</div>
        </div>
      </div>
    </WCard>

    <!-- Training Required Card -->
    <WCard flat class="tw:p-4">
      <div class="tw:flex tw:items-center tw:gap-3">
        <div class="tw:bg-main-hover tw:rounded-lg tw:p-2">
          <WIcon name="school" size="24px" class="tw:text-blue-600" />
        </div>
        <div>
          <div class="tw:text-2xl tw:font-bold tw:text-on-sidebar">{{ withTraining }}</div>
          <div class="tw:text-xs tw:text-secondary">With Training</div>
        </div>
      </div>
    </WCard>
  </div>
</template>

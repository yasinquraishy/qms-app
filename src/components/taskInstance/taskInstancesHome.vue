<script setup>
import { useTaskInstances } from '@/composables/useTaskInstances.js'

const { filters, fetchTaskInstances } = useTaskInstances()

onMounted(() => fetchTaskInstances())
</script>

<template>
  <div class="tw:flex tw:flex-col tw:gap-3 tw:h-full tw:p-5">
    <SafeTeleport to="#main-header-title">
      <div>
        <div class="tw:text-xl tw:font-bold tw:text-on-main">My Tasks</div>
        <div class="tw:text-xs tw:text-secondary tw:hidden tw:sm:block">
          Review and act on approval tasks assigned to you.
        </div>
      </div>
    </SafeTeleport>

    <TaskInstancesFilterToolbar v-model:filters="filters" />

    <div class="tw:flex tw:gap-4 tw:flex-1 tw:min-h-0">
      <div class="tw:flex-1 tw:min-w-0 tw:flex tw:flex-col">
        <TaskInstancesTable />
      </div>
    </div>
  </div>
</template>

<script setup>
const model = defineModel({ type: Object, required: true })

const firstDayOfWeekOptions = [
  { label: 'Monday', value: 1 },
  { label: 'Tuesday', value: 2 },
  { label: 'Wednesday', value: 3 },
  { label: 'Thursday', value: 4 },
  { label: 'Friday', value: 5 },
  { label: 'Saturday', value: 6 },
  { label: 'Sunday', value: 0 },
]
</script>

<template>
  <div
    class="tw:rounded-xl tw:border tw:border-divider tw:shadow-sm tw:overflow-hidden tw:bg-sidebar"
  >
    <!-- Card Header -->
    <div class="tw:px-6 tw:py-4 tw:border-b tw:border-divider tw:bg-main-hover">
      <h2 class="tw:text-lg tw:font-bold tw:text-on-sidebar">Regional Settings</h2>
    </div>

    <!-- Card Content -->
    <div class="tw:p-6 tw:grid tw:grid-cols-1 tw:md:grid-cols-2 tw:gap-6">
      <!-- Default Time Zone -->
      <TimezoneDropdown
        v-model="model.defaultTimeZone"
        label="Default Time Zone"
        hint="Used for timestamps and scheduling"
      />

      <!-- First Day of Week -->
      <div class="tw:flex tw:flex-col tw:gap-1">
        <label class="tw:text-sm tw:font-medium tw:text-secondary">First Day of Week</label>
        <select
          v-model.number="model.defaultFirstDayOfWeek"
          class="tw:w-full tw:px-3 tw:py-2 tw:text-sm tw:rounded-lg tw:border tw:border-divider tw:bg-main tw:text-on-main tw:focus:outline-none tw:focus:ring-2 tw:focus:ring-primary"
        >
          <option v-for="opt in firstDayOfWeekOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
        <p class="tw:text-xs tw:text-secondary">Used for calendar views</p>
      </div>
    </div>
  </div>
</template>

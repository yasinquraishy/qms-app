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
      <WSelect
        v-model="model.defaultFirstDayOfWeek"
        label="First Day of Week"
        :options="firstDayOfWeekOptions"
        optionLabel="label"
        optionValue="value"
        emitValue
        mapOptions
        hint="Used for calendar views"
      />
    </div>
  </div>
</template>

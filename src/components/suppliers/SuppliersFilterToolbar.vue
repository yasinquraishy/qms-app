<script setup>
const filters = defineModel('filters', {
  type: Object,
  required: true,
})

const categoryOptions = [
  { label: 'All Categories', value: null },
  { label: 'Raw Materials', value: 'Raw Materials' },
  { label: 'Component', value: 'Component' },
  { label: 'Service', value: 'Service' },
  { label: 'Software', value: 'Software' },
]

const riskLevelOptions = [
  { label: 'All Risk Levels', value: null },
  { label: 'Low', value: 'Low' },
  { label: 'Medium', value: 'Medium' },
  { label: 'High', value: 'High' },
]

const statusOptions = [
  { label: 'All Statuses', value: null },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Blocked', value: 'BLOCKED' },
]
</script>

<template>
  <WCard flat class="tw:bg-main-hover tw:mb-2">
    <div class="tw:flex tw:items-center tw:p-2 tw:gap-2 tw:flex-wrap">
      <!-- Search -->
      <div class="tw:w-full tw:md:w-1/4">
        <WInput
          v-model="filters.search"
          placeholder="Search suppliers..."
          dense
          bgColor="white"
          hideBottomSpace
          clearable
        >
          <template #prepend>
            <WIcon name="search" color="grey-6" />
          </template>
        </WInput>
      </div>

      <!-- Status -->
      <div class="tw:w-full tw:md:w-1/6">
        <WSelect
          v-model="filters.statusId"
          :options="statusOptions"
          dense
          bgColor="white"
          hideBottomSpace
          emitValue
          mapOptions
          optionValue="value"
          optionLabel="label"
        />
      </div>

      <!-- Category -->
      <div class="tw:w-full tw:md:w-1/6">
        <WSelect
          v-model="filters.category"
          :options="categoryOptions"
          dense
          bgColor="white"
          hideBottomSpace
          emitValue
          mapOptions
          optionValue="value"
          optionLabel="label"
        />
      </div>

      <!-- Risk Level -->
      <div class="tw:w-full tw:md:w-1/6">
        <WSelect
          v-model="filters.riskLevel"
          :options="riskLevelOptions"
          dense
          bgColor="white"
          hideBottomSpace
          emitValue
          mapOptions
          optionValue="value"
          optionLabel="label"
        />
      </div>

      <QSpace />
    </div>
  </WCard>
</template>

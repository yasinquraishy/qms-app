<script setup>
const filters = defineModel('filters', {
  type: Object,
  required: true,
})

const statusOptions = [
  { label: 'Assigned', value: 'ASSIGNED' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Changes Requested', value: 'CHANGES_REQUESTED' },
]
</script>

<template>
  <div class="tw:flex tw:items-center tw:gap-2 tw:p-2 tw:rounded-lg tw:bg-sidebar">
    <SafeTeleport to="#main-header-search">
      <WInput
        v-model="filters.search"
        placeholder="Search by title or document number..."
        class="tw:flex-1 tw:max-w-md"
      >
        <template #prepend>
          <WIcon icon="search" />
        </template>
      </WInput>
    </SafeTeleport>

    <WSelect
      v-model="filters.statusId"
      :options="statusOptions"
      optionValue="value"
      optionLabel="label"
      label="Status"
      clearable
      emitValue
      mapOptions
      class="tw:min-w-40"
    />
  </div>
</template>

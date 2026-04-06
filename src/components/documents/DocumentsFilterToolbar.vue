<script setup>
const filters = defineModel('filters', {
  type: Object,
  required: true,
})
</script>

<template>
  <WCard flat class="tw:bg-main-hover tw:mb-2">
    <div class="tw:flex tw:items-center tw:p-2 tw:gap-2 tw:flex-wrap">
      <!-- Search -->
      <div class="tw:w-full tw:md:w-1/4">
        <WInput
          v-model="filters.search"
          placeholder="Search documents..."
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

      <!-- Document Type Filter -->
      <div class="tw:w-full tw:md:w-1/5">
        <DocumentsDocumentTemplateSelect
          v-model:documentTypeId="filters.documentTypeId"
          label="Document Type"
          bgColor="white"
          hideBottomSpace
        />
      </div>

      <!-- Department Filter -->
      <div class="tw:w-full tw:md:w-1/5">
        <DocumentsDepartmentSelect
          v-model:departmentId="filters.departmentId"
          label="Department"
          bgColor="white"
          hideBottomSpace
        />
      </div>

      <!-- Status Filter -->
      <div class="tw:w-full tw:md:w-1/5">
        <DocumentsVersionStatusSelect
          v-model:statusId="filters.statusId"
          label="Status"
          bgColor="white"
          hideBottomSpace
        />
      </div>

      <QSpace />
    </div>
  </WCard>
</template>

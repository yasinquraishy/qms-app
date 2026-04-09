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
        <label class="tw:block tw:mb-1 tw:text-md tw:font-medium tw:text-on-main">
          Document Type:
        </label>
        <DocumentTypeSelectMenu
          v-model="filters.documentTypeId"
          :multiple="false"
          :required="false"
        />
      </div>

      <!-- Department Filter -->
      <div class="tw:w-full tw:md:w-1/5">
        <label class="tw:block tw:mb-1 tw:text-md tw:font-medium tw:text-on-main">
          Department:
        </label>
        <DepartmentSelectMenu v-model="filters.departmentId" />
      </div>

      <!-- Status Filter -->
      <div class="tw:w-full tw:md:w-1/5">
        <label class="tw:block tw:mb-1 tw:text-md tw:font-medium tw:text-on-main"> Status: </label>
        <DocumentVersionStatusSelectMenu
          v-model="filters.statusId"
          label="Status"
          bgColor="white"
          hideBottomSpace
        />
      </div>

      <QSpace />
    </div>
  </WCard>
</template>

<script setup>
const filters = defineModel('filters', {
  type: Object,
  required: true,
})
</script>

<template>
  <div class="tw:flex tw:items-center tw:gap-2 tw:p-2 tw:rounded-lg tw:bg-sidebar">
    <SafeTeleport to="#main-header-search">
      <WInput
        v-model="filters.search"
        placeholder="Search templates by name or code..."
        class="tw:flex-1 tw:max-w-md"
      >
        <template #prepend>
          <WIcon icon="search" />
        </template>
      </WInput>
    </SafeTeleport>

    <div class="tw:flex-1 tw:min-w-40">
      <formTemplatesDocumentTypeSelect v-model:documentTypeId="filters.documentTypeId" multiple />
    </div>

    <div class="tw:flex-1 tw:min-w-40">
      <formTemplatesSiteSelect v-model:siteId="filters.siteId" multiple />
    </div>
    <div class="tw:flex-1 tw:min-w-40">
      <formTemplatesStatusSelect v-model:statusId="filters.statusId" />
    </div>

    <!-- Actions Slot -->
    <slot name="actions" />
  </div>
</template>

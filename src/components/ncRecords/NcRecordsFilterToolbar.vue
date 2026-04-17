<script setup>
import { IconSearch } from '@tabler/icons-vue'

const filters = defineModel('filters', {
  type: Object,
  required: true,
})
</script>

<template>
  <div class="tw:flex tw:flex-wrap tw:items-center tw:gap-2">
    <BaseTextInput
      v-model="filters.search"
      placeholder="Search by title, NC number..."
      :clearBtn="true"
      class="tw:min-w-60"
    >
      <template #prepend>
        <IconSearch class="tw:size-4 tw:text-placeholder" />
      </template>
    </BaseTextInput>

    <NcStatusSelectMenu v-model="filters.statusId" class="tw:min-w-40" />

    <NcSeveritySelectMenu v-model="filters.severityId" class="tw:min-w-36" />

    <SiteSelectMenu v-model="filters.siteId" class="tw:min-w-36" />
  </div>
</template>

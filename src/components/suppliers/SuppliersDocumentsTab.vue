<script setup>
import { IconFileDescription, IconExternalLink } from '@tabler/icons-vue'

const props = defineProps({
  supplier: {
    type: Object,
    required: true,
  },
})

const documents = computed(() => props.supplier.documents || [])

const typeLabel = {
  certificate: 'Certificate',
  license: 'License',
}
</script>

<template>
  <div
    class="tw:bg-sidebar tw:rounded-xl tw:shadow-sm tw:border tw:border-divider tw:overflow-hidden"
  >
    <div
      class="tw:px-6 tw:py-4 tw:border-b tw:border-divider tw:bg-main-hover tw:flex tw:items-center tw:gap-3"
    >
      <div
        class="tw:w-10 tw:h-10 tw:rounded-lg tw:bg-gray-100 tw:flex tw:items-center tw:justify-center"
      >
        <IconFileDescription :size="20" class="tw:text-secondary" />
      </div>
      <h3 class="tw:text-lg tw:font-bold tw:text-on-main">Documents</h3>
      <span
        v-if="documents.length"
        class="tw:inline-flex tw:items-center tw:justify-center tw:rounded-full tw:bg-gray-200 tw:text-gray-700 tw:px-2 tw:py-0.5 tw:text-[10px] tw:font-bold"
        >{{ documents.length }}</span
      >
    </div>
    <div v-if="documents.length" class="tw:divide-y tw:divide-divider">
      <div
        v-for="doc in documents"
        :key="doc.id"
        class="tw:p-4 tw:flex tw:items-center tw:gap-4 tw:hover:bg-main-hover tw:transition-colors"
      >
        <div
          class="tw:w-10 tw:h-10 tw:rounded-lg tw:bg-primary/10 tw:flex tw:items-center tw:justify-center tw:shrink-0"
        >
          <IconFileDescription :size="20" class="tw:text-primary" />
        </div>
        <div class="tw:flex-1 tw:min-w-0">
          <p class="tw:text-sm tw:font-medium tw:text-on-main tw:truncate">
            {{ doc.asset?.fileName || 'Document' }}
          </p>
          <p class="tw:text-xs tw:text-secondary">
            {{ typeLabel[doc.documentType] || doc.documentType }}
          </p>
        </div>
        <p class="tw:text-xs tw:text-secondary">
          {{ doc.createdAt?.formatDate('date') }}
        </p>
        <a
          v-if="doc.asset?.url"
          :href="doc.asset.url"
          target="_blank"
          class="tw:p-1 tw:rounded tw:text-secondary tw:hover:text-primary tw:transition-colors"
          title="Open document"
        >
          <IconExternalLink :size="16" />
        </a>
      </div>
    </div>

    <BaseEmptyState
      v-else
      :icon="IconFileDescription"
      title="No documents attached to this supplier."
    />
  </div>
</template>

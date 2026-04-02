<script setup>
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
        <QIcon name="description" class="tw:text-secondary" size="sm" />
      </div>
      <h3 class="tw:text-lg tw:font-bold tw:text-on-main">Documents</h3>
      <QBadge v-if="documents.length" color="grey-5" textColor="grey-8" class="tw:rounded-full">
        <span class="tw:text-[10px] tw:px-2 tw:py-0.5 tw:font-bold">{{ documents.length }}</span>
      </QBadge>
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
          <QIcon name="description" color="primary" size="sm" />
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
      </div>
    </div>
    <div v-else class="tw:py-12 tw:text-center">
      <QIcon name="description" size="40px" class="tw:text-secondary/50 tw:mb-2" />
      <p class="tw:text-secondary tw:text-sm">No documents attached to this supplier.</p>
    </div>
  </div>
</template>

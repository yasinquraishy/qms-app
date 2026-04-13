<script setup>
defineProps({
  documentId: {
    type: String,
    required: true,
  },
  versionId: {
    type: String,
    default: null,
  },
})

provideApprovalWorkflowInstances()
</script>

<template>
  <main class="tw:max-w-360 tw:mx-auto tw:px-6 tw:py-8 tw:w-full">
    <PrintTeleport>
      <div class="tw:grid tw:grid-cols-1 tw:lg:grid-cols-4 tw:gap-8">
        <!-- Left Column: Document Content (3/4 width) -->
        <DocumentsMainContentLeft :documentId="documentId" :versionId="versionId" />

        <!-- Right Column: Sidebar (1/4 width, sticky) -->
        <DocumentsMainContentRight :documentId="documentId" :versionId="versionId" />
      </div>
    </PrintTeleport>
  </main>
</template>

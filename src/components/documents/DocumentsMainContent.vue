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
  reviewMode: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <main class="tw:max-w-360 tw:mx-auto tw:px-6 tw:py-8 tw:w-full">
    <PrintTeleport>
      <div class="tw:grid tw:grid-cols-1 tw:lg:grid-cols-3 tw:gap-8">
        <!-- Left Column: Document Content (2/3 width) -->
        <DocumentsMainContentLeft
          :documentId="documentId"
          :versionId="versionId"
          :reviewMode="reviewMode"
        />

        <!-- Right Column: Sidebar (1/3 width, sticky) -->
        <DocumentsMainContentRight
          :documentId="documentId"
          :versionId="versionId"
          :reviewMode="reviewMode"
        />
      </div>
    </PrintTeleport>
  </main>
</template>

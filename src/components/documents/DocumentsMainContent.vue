<script setup>
defineProps({
  document: {
    type: Object,
    required: true,
  },
  currentVersion: {
    type: Object,
    default: null,
  },
  canEdit: {
    type: Boolean,
    default: false,
  },
  reviewMode: {
    type: Boolean,
    default: false,
  },
})

provideApprovalWorkflowInstances()
</script>

<template>
  <main class="tw:max-w-360 tw:mx-auto tw:px-6 tw:py-8 tw:w-full">
    <PrintTeleport>
      <div class="tw:grid tw:grid-cols-1 tw:lg:grid-cols-4 tw:gap-8">
        <!-- Left Column: Document Content (3/4 width) -->
        <DocumentsMainContentLeft
          :document="document"
          :currentVersion="currentVersion"
          :canEdit="canEdit"
          :reviewMode="reviewMode"
        />

        <!-- Right Column: Sidebar (1/4 width, sticky) -->
        <DocumentsMainContentRight
          :document="document"
          :currentVersion="currentVersion"
          :canEdit="canEdit"
        />
      </div>
    </PrintTeleport>
  </main>
</template>

<script setup>
import { IconPlus, IconFileText } from '@tabler/icons-vue'

const props = defineProps({
  documentVersionId: {
    type: String,
    required: true,
  },
  documentId: {
    type: String,
    required: true,
  },
  canEdit: {
    type: Boolean,
    default: false,
  },
  dense: {
    type: Boolean,
    default: false,
  },
  reviewMode: {
    type: Boolean,
    default: false,
  },
})

const sections = useLiveQueryWithDeps(
  [() => props.documentVersionId],
  async (db, [versionId]) => {
    return db.DocumentSection.where('documentVersionId', versionId).orderBy('order', 'asc').exec()
  },
  { initial: [], models: 'DocumentSection' },
)

const showAddSectionDialog = ref(false)
</script>

<template>
  <div>
    <section v-for="section in sections" :id="section.id" :key="section.id">
      <DocumentVersionSection
        :sectionId="section.id"
        :documentVersionId="documentVersionId"
        :canEdit="canEdit"
        :dense="dense"
        :reviewMode="reviewMode"
      />
    </section>

    <!-- Empty state -->
    <BaseEmptyState
      v-if="sections.length === 0"
      :icon="IconFileText"
      title="No content sections available"
      dense
    />

    <!-- Add Section Button -->
    <div
      v-if="canEdit"
      class="tw:border-t tw:border-divider tw:print:hidden"
      :class="dense ? 'tw:mt-4 tw:pt-3' : 'tw:mt-8 tw:pt-6'"
    >
      <BaseButton variant="outline" class="tw:w-full" @click="showAddSectionDialog = true">
        <template #icon>
          <IconPlus :size="20" />
        </template>
        Add Section
      </BaseButton>
    </div>

    <DocumentsAddSectionDialog
      v-model="showAddSectionDialog"
      :documentVersionId="documentVersionId"
      :documentId="documentId"
      :currentSectionCount="sections.length"
    />
  </div>
</template>

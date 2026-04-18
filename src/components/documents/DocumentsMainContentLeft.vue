<script setup>
import { isAllowed } from '@/utils/currentSession.js'
import { IconMessageExclamation, IconPencil } from '@tabler/icons-vue'

const props = defineProps({
  documentId: {
    type: String,
    required: true,
  },
  versionId: {
    type: String,
    default: null,
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

const document = useLiveQueryWithDeps([() => props.documentId], async (db, [id]) => {
  return db.Document.findByPk(id)
})

const currentVersion = useLiveQueryWithDeps([() => props.versionId], async (db, [id]) => {
  return id ? db.DocumentVersion.findByPk(id) : null
})

const canEdit = computed(
  () =>
    isAllowed(['documents:update']) && document.value?.statusId !== 'ARCHIVED' && !props.reviewMode,
)

const canUpdateVersion = computed(() => {
  return (
    canEdit.value &&
    currentVersion.value &&
    ['DRAFT', 'REJECTED'].includes(currentVersion.value.statusId)
  )
})

const versionLabel = computed(() => {
  const v = currentVersion.value
  if (!v) return ''
  return v.versionLabel || `${v.versionMajor}.${v.versionMinor}`
})

// ─── Inline title edit ────────────────────────────────────────────────────────

const editingTitle = ref(false)
const isSavingTitle = ref(false)

async function saveTitle() {
  editingTitle.value = false
  if (!document.value) return
  isSavingTitle.value = true
  try {
    await document.value.save()
  } finally {
    isSavingTitle.value = false
  }
}
</script>

<template>
  <div v-if="document && currentVersion" class="tw:lg:col-span-3 tw:space-y-6">
    <!-- Document Card -->
    <div
      class="tw:bg-sidebar tw:rounded-xl tw:shadow-sm tw:border tw:border-divider tw:print:border-0 tw:print:shadow-none tw:overflow-hidden"
    >
      <!-- Document Header -->
      <div
        class="tw:border-b tw:border-divider tw:bg-main-hover"
        :class="dense ? 'tw:p-4' : 'tw:p-8'"
      >
        <div
          class="tw:flex tw:items-start tw:justify-between"
          :class="dense ? 'tw:mb-2' : 'tw:mb-4'"
        >
          <DocumentVersionStatusBadgeById :statusId="currentVersion?.statusId" />

          <span class="tw:text-secondary tw:text-sm tw:font-mono">
            {{ document.docNumber }} v{{ versionLabel }}
          </span>
        </div>
        <template v-if="editingTitle && canEdit">
          <BaseTextInput
            v-model="document.title"
            autofocus
            class="tw:font-extrabold"
            :class="dense ? 'tw:text-xl' : 'tw:text-3xl'"
            @blur="saveTitle"
            @keyup.enter="saveTitle"
            @keyup.esc="editingTitle = false"
          />
        </template>
        <h2
          v-else
          class="tw:font-extrabold tw:text-on-sidebar tw:leading-tight tw:flex tw:items-center tw:gap-2 tw:group"
          :class="[dense ? 'tw:text-xl' : 'tw:text-3xl', { 'tw:cursor-pointer': canEdit }]"
          @click="canEdit && (editingTitle = true)"
        >
          {{ document.title }}
          <IconPencil
            v-if="canEdit"
            :size="dense ? 14 : 18"
            class="tw:opacity-0 tw:group-hover:opacity-100 tw:transition-opacity tw:text-primary/50 tw:shrink-0"
          />
        </h2>
        <p
          v-if="currentVersion?.changeSummary"
          class="tw:text-secondary tw:max-w-2xl"
          :class="dense ? 'tw:mt-1 tw:text-xs' : 'tw:mt-2'"
        >
          {{ currentVersion.changeSummary }}
        </p>

        <!-- Reviewer Feedback (shown when rejected or changes requested) -->
        <div
          v-if="
            currentVersion?.rejectComment &&
            ['REJECTED', 'CHANGES_REQUESTED'].includes(currentVersion?.statusId)
          "
          class="tw:mt-4 tw:rounded-lg tw:border tw:border-red-200 tw:bg-red-50 tw:dark:bg-red-950/20 tw:dark:border-red-800 tw:p-4"
        >
          <div class="tw:flex tw:items-center tw:gap-2 tw:mb-2">
            <IconMessageExclamation :size="18" class="tw:text-red-600" />
            <span class="tw:text-sm tw:font-semibold tw:text-red-700 tw:dark:text-red-400">
              Reviewer Feedback
            </span>
          </div>
          <p
            class="tw:text-sm tw:text-red-800 tw:dark:text-red-300 tw:mb-0! tw:whitespace-pre-wrap"
          >
            {{ currentVersion.rejectComment }}
          </p>
        </div>
      </div>

      <!-- Document Body Sections -->
      <div
        class="tw:prose tw:prose-slate tw:dark:prose-invert tw:max-w-none"
        :class="dense ? 'tw:p-4' : 'tw:p-8'"
      >
        <DocumentVersionSectionsList
          v-if="currentVersion"
          :documentVersionId="currentVersion.id"
          :documentId="documentId"
          :canEdit="canUpdateVersion"
          :dense="dense"
          :reviewMode="reviewMode"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Ensure proper prose styling for document content */
.tw\:prose :deep(p) {
  margin-bottom: 1rem;
}

.tw\:prose :deep(ul),
.tw\:prose :deep(ol) {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.tw\:prose :deep(li) {
  margin-bottom: 0.5rem;
}

.tw\:prose :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.tw\:prose :deep(th),
.tw\:prose :deep(td) {
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  text-align: left;
}

.tw\:prose :deep(th) {
  background-color: #f8fafc;
  font-weight: 600;
}

.tw\:prose :deep(blockquote) {
  border-left: 4px solid #136dec;
  padding-left: 1rem;
  margin: 1rem 0;
  font-style: italic;
  background-color: rgba(19, 109, 236, 0.05);
  padding: 1rem;
  border-radius: 0.25rem;
}

/* Dark mode adjustments */
:deep(.dark) .tw\:prose table th,
:deep(.dark) .tw\:prose table td {
  border-color: #334155;
}

:deep(.dark) .tw\:prose table th {
  background-color: #1e293b;
}
</style>

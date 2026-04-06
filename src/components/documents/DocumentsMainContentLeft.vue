<script setup>
import { useComments } from '@/composables/useComments.js'
import { currentSession } from '@/utils/currentSession.js'

const props = defineProps({
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
  dense: {
    type: Boolean,
    default: false,
  },
  reviewMode: {
    type: Boolean,
    default: false,
  },
})

const { updateVersion } = useDocuments()

// ── Review Mode: Inline section comments ───────────────────────────────────
const { comments, fetchComments, createComment, updateComment } = useComments()

// Local comment text per section (keyed by section ID)
const sectionCommentText = ref({})
const savingComment = ref({})

// State
const editingSection = ref(null) // { sectionId, type: 'title' | 'content' }
const showAddSectionDialog = ref(false)

// Computed properties
const documentSections = computed(() => {
  return props.currentVersion?.sections || []
})

const canUpdateVersion = computed(() => {
  return (
    props.canEdit &&
    props.currentVersion &&
    ['DRAFT', 'REJECTED'].includes(props.currentVersion.statusId)
  )
})

const versionLabel = computed(() => {
  const v = props.currentVersion
  if (!v) return ''
  return v.versionLabel || `${v.versionMajor}.${v.versionMinor}`
})

function startEditingTitle(section) {
  if (!canUpdateVersion.value) return
  editingSection.value = { sectionId: section.id, type: 'title' }
}

function startEditingContent(section) {
  if (!canUpdateVersion.value) return
  editingSection.value = { sectionId: section.id, type: 'content' }
}

function stopEditing() {
  editingSection.value = null
}

function isEditingTitle(sectionId) {
  return editingSection.value?.sectionId === sectionId && editingSection.value?.type === 'title'
}

function isEditingContent(sectionId) {
  return editingSection.value?.sectionId === sectionId && editingSection.value?.type === 'content'
}

function openAddSectionDialog() {
  showAddSectionDialog.value = true
}

const debouncedSave = useDebounceFn((newSections) => {
  if (canUpdateVersion.value) {
    updateVersion(props.document.id, props.currentVersion.id, {
      sections: newSections,
    })
  }
}, 500)

watch(
  documentSections,
  (newSections) => {
    debouncedSave(newSections)
  },
  { deep: true },
)

useEventListener('click', (event) => {
  if (event.target.closest('.q-dialog')) return
  stopEditing()
})

// Fetch comments depending on mode:
// - reviewMode=true: fetch current reviewer's own comments
// - reviewMode=false + rejected version: fetch rejecting reviewer's comments
watch(
  [() => props.reviewMode, () => props.currentVersion],
  async ([isReview, version]) => {
    comments.value = []
    sectionCommentText.value = {}

    const sections = version?.sections || []
    if (sections.length === 0) return

    const objectId = sections.map((s) => s.id).join(',')

    if (isReview) {
      await fetchComments({
        objectType: 'DocumentSection',
        objectId,
        userId: currentSession.value?.id,
      })
      for (const comment of comments.value) {
        sectionCommentText.value[comment.objectId] = comment.body
      }
    } else if (
      ['REJECTED', 'CHANGES_REQUESTED'].includes(version?.statusId) &&
      version?.rejectedBy?.id
    ) {
      await fetchComments({
        objectType: 'DocumentSection',
        objectId,
        userId: version.rejectedBy.id,
      })
    }
  },
  { immediate: true },
)

function getReviewerComment(sectionId) {
  return comments.value.find((c) => c.objectId === sectionId) || null
}

const debouncedSaveComment = useDebounceFn(async (sectionId) => {
  const text = sectionCommentText.value[sectionId]?.trim()
  const existing = comments.value.find((c) => c.objectId === sectionId)

  savingComment.value[sectionId] = true
  try {
    if (existing && text) {
      await updateComment(existing.id, { body: text })
    } else if (!existing && text) {
      await createComment({
        body: text,
        objectType: 'DocumentSection',
        objectId: sectionId,
      })
    }
  } finally {
    savingComment.value[sectionId] = false
  }
}, 800)
</script>

<template>
  <div class="tw:lg:col-span-3 tw:space-y-6">
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
          <WStatusBadge :status="currentVersion?.statusId" variant="document" showIcon />

          <span class="tw:text-secondary tw:text-sm tw:font-mono">
            {{ document.docNumber }} v{{ versionLabel }}
          </span>
        </div>
        <h2
          class="tw:font-extrabold tw:text-on-sidebar tw:leading-tight"
          :class="dense ? 'tw:text-xl' : 'tw:text-3xl'"
        >
          {{ document.title }}
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
            <WIcon name="feedback" size="18px" class="tw:text-red-600" />
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
        <section
          v-for="(section, index) in documentSections"
          :id="section.id"
          :key="section.id"
          class="tw:break-inside-avoid"
          :class="{ ' tw:pt-10': index > 0 && !dense, ' tw:pt-4': index > 0 && dense }"
        >
          <!-- Section Title -->
          <QInput
            v-if="isEditingTitle(section.id)"
            v-model="section.title"
            dense
            outlined
            class="tw:mb-4"
            autofocus
            @blur="stopEditing"
            @keyup.enter="stopEditing"
          >
            <template #prepend>
              <span class="tw:text-xl tw:font-bold">{{ index + 1 }}.</span>
            </template>
          </QInput>
          <h3
            v-else
            class="tw:font-bold tw:flex tw:items-center tw:gap-2"
            :class="[
              dense ? 'tw:text-base tw:mb-2' : 'tw:text-xl tw:mb-4',
              { 'tw:cursor-pointer tw:px-2 tw:-mx-2 tw:group': canEdit },
            ]"
            @click.prevent.stop="startEditingTitle(section)"
          >
            <span>{{ index + 1 }}. {{ section.title }}</span>
            <WIcon
              v-if="canUpdateVersion"
              name="edit"
              size="16px"
              class="tw:opacity-0 tw:group-hover:opacity-100 tw:transition-opacity tw:text-primary/50"
            />
          </h3>

          <!-- Section Content -->
          <div
            class="tw:group tw:relative section-content"
            @click.prevent.stop="startEditingContent(section)"
          >
            <div class="tw:absolute tw:-top-5 tw:right-0">
              <WIcon
                v-if="canUpdateVersion"
                name="edit"
                size="16px"
                class="tw:opacity-0 tw:group-hover:opacity-100 tw:transition-opacity tw:text-primary/50"
              />
            </div>
            <TiptapEditor
              v-if="section.sectionType === 'text'"
              :key="`${section.id}-${isEditingContent(section.id)}`"
              v-model="section.content"
              :editable="isEditingContent(section.id)"
              class="tw:border-0! tw:min-h-fit!"
              :class="{ 'tw:cursor-pointer': canEdit && !isEditingContent(section.id) }"
            />

            <WUploader
              v-if="section.sectionType === 'attachment'"
              v-model="section.attachments"
              :readonly="!isEditingContent(section.id)"
              hideHeader
              class="tw:border-0 tw:shadow-none! tw:p-0"
              :class="{ 'tw:cursor-pointer': canEdit && !isEditingContent(section.id) }"
            />
          </div>

          <!-- Reviewer Inline Comment (review mode — editable) -->
          <div v-if="reviewMode" class="tw:mt-4">
            <div class="tw:flex tw:items-center tw:gap-2 tw:mb-1">
              <WIcon name="rate_review" size="16px" class="tw:text-primary" />
              <span class="tw:text-xs tw:font-semibold tw:text-primary">Your Comment</span>
              <WIcon
                v-if="savingComment[section.id]"
                name="sync"
                size="14px"
                class="tw:text-secondary tw:animate-spin"
              />
            </div>
            <WInput
              v-model="sectionCommentText[section.id]"
              type="textarea"
              :rows="2"
              placeholder="Add feedback for this section..."
              dense
              outlined
              class="tw:text-sm"
              @update:modelValue="debouncedSaveComment(section.id)"
            />
          </div>

          <!-- Owner Feedback Display (read-only — shown when rejected) -->
          <div
            v-else-if="getReviewerComment(section.id)"
            class="tw:mt-4 tw:rounded-lg tw:border tw:border-orange-200 tw:bg-orange-50 tw:dark:bg-orange-950/20 tw:dark:border-orange-800 tw:p-3"
          >
            <div class="tw:flex tw:items-center tw:gap-2 tw:mb-1">
              <WIcon name="feedback" size="16px" class="tw:text-orange-600" />
              <span class="tw:text-xs tw:font-semibold tw:text-orange-700 tw:dark:text-orange-400">
                Reviewer Feedback — {{ getReviewerComment(section.id).user?.firstName }}
                {{ getReviewerComment(section.id).user?.lastName }}
              </span>
            </div>
            <p
              class="tw:text-sm tw:text-orange-800 tw:dark:text-orange-300 tw:mb-0! tw:whitespace-pre-wrap"
            >
              {{ getReviewerComment(section.id).body }}
            </p>
          </div>
        </section>

        <!-- Empty state if no sections -->
        <WEmptyState
          v-if="documentSections.length === 0"
          icon="description"
          title="No content sections available"
          compact
        />

        <!-- Add Section Button -->
        <div
          v-if="canEdit"
          class="tw:border-t tw:border-divider tw:print:hidden"
          :class="dense ? 'tw:mt-4 tw:pt-3' : 'tw:mt-8 tw:pt-6'"
        >
          <WBtn outline color="primary" class="tw:w-full" @click="openAddSectionDialog">
            <WIcon name="add" class="tw:mr-2" size="20px" />
            Add Section
          </WBtn>
        </div>
      </div>
    </div>

    <!-- Add Section Dialog -->
    <DocumentsAddSectionDialog v-model="showAddSectionDialog" :currentVersion="currentVersion" />
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

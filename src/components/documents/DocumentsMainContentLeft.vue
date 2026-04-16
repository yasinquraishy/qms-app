<script setup>
import { isAllowed, currentSession } from '@/utils/currentSession.js'
import {
  IconPencil,
  IconPlus,
  IconMessageCheck,
  IconMessageExclamation,
  IconLoader2,
  IconFileText,
} from '@tabler/icons-vue'

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

const rejectInstance = useLiveQueryWithDeps(
  [() => currentVersion.value?.workflowInstanceId],
  async (db, [workflowInstanceId]) => {
    if (!workflowInstanceId) return null
    const instance = await db.ApprovalWorkflowInstance.findByPk(workflowInstanceId)
    if (['REJECTED', 'CHANGES_REQUESTED'].includes(instance.statusId)) {
      return instance
    }
    return instance
  },
  { models: 'ApprovalWorkflowInstance' },
)

const rejectedInstanceStep = useLiveQueryWithDeps(
  [() => rejectInstance.value?.id],
  async (db, [instanceId]) => {
    if (!instanceId) return null
    const step = await db.ApprovalWorkflowInstanceStep.where('[workflowInstanceId+statusId]', [
      [instanceId, 'REJECTED'],
      [instanceId, 'CHANGES_REQUESTED'],
    ]).first()
    return step
  },
  { models: 'ApprovalWorkflowInstanceStep' },
)

const rejectedTask = useLiveQueryWithDeps(
  [() => rejectedInstanceStep.value?.id],
  async (db, [stepId]) => {
    if (!stepId) return null
    const task = await db.TaskInstance.where('[sourceType+sourceId]', [
      'ApprovalWorkflowInstanceStep',
      stepId,
    ])
      .where('statusId', 'REJECTED')
      .first()
    return task
  },
)

const canEdit = computed(
  () =>
    isAllowed(['documents:update']) && document.value?.statusId !== 'ARCHIVED' && !props.reviewMode,
)

// ── Review Mode: Inline section comments ───────────────────────────────────
// Load section comments from IDB — filtered by reviewer userId
const sectionComments = useLiveQueryWithDeps(
  [
    () => props.reviewMode,
    () => currentSession.value?.userId,
    () => props.versionId,
    () => currentVersion.value?.statusId,
    () =>
      Array.isArray(currentVersion.value?.sections)
        ? currentVersion.value.sections.map((s) => s.id)
        : [],
    () => rejectedTask.value?.assignedTo,
  ],
  async (db, [isReview, currentUserId, versionId, versionStatusId, sectionIds, rejectedBy]) => {
    if (!versionId) return []

    if (['REJECTED', 'CHANGES_REQUESTED'].includes(versionStatusId)) {
      // Show all section comments on rejected versions (reviewer's feedback)
      return await db.Comment.where(
        '[objectType+objectId]',
        sectionIds.map((id) => ['DocumentSection', id]),
      )
        .where('userId', rejectedBy)
        .exec()
    }

    if (isReview) {
      // Show only reviewer's own comments during review
      return await db.Comment.where(
        '[objectType+objectId]',
        sectionIds.map((id) => ['DocumentSection', id]),
      )
        .where('userId', currentUserId)
        .exec()
    }

    return []
  },
  { initial: [], models: 'Comment' },
)

// Local comment text per section (keyed by section ID)
const sectionCommentText = ref({})
const savingComment = ref({})

// State
const editingSection = ref(null) // { sectionId, type: 'title' | 'content' }
const showAddSectionDialog = ref(false)

// Computed properties
const documentSections = computed(() => {
  return currentVersion.value?.sections || []
})

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

const debouncedSave = useDebounceFn(async () => {
  if (canUpdateVersion.value) {
    await currentVersion.value.save() // Saves the changes
  }
}, 500)

watch(
  documentSections,
  () => {
    debouncedSave()
  },
  { deep: true },
)

useEventListener('click', (event) => {
  if (event.target.closest('[role="dialog"]')) return
  stopEditing()
})

function getReviewerComment(sectionId) {
  return sectionComments.value.find((c) => c.objectId === sectionId) || null
}

// Populate text inputs when comments are loaded or review starts
watch(
  sectionComments,
  (newComments) => {
    if (!props.reviewMode) return
    for (const comment of newComments) {
      if (!(comment.objectId in sectionCommentText.value)) {
        sectionCommentText.value[comment.objectId] = comment.body
      }
    }
  },
  { immediate: true },
)

const debouncedSaveComment = useDebounceFn(async (sectionId) => {
  const text = sectionCommentText.value[sectionId]?.trim()
  const existing = getReviewerComment(sectionId)

  savingComment.value[sectionId] = true
  try {
    if (existing && text) {
      existing.body = text
      await existing.save()
    } else if (!existing && text) {
      const create = useLiveMutation(async (db) => {
        const comment = db.Comment.create({
          body: text,
          objectType: 'DocumentSection',
          objectId: sectionId,
        })
        await comment.save()
      })
      await create()
    }
  } finally {
    savingComment.value[sectionId] = false
  }
}, 800)
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
        <section
          v-for="(section, index) in documentSections"
          :id="section.id"
          :key="section.id"
          class="tw:break-inside-avoid"
          :class="{ ' tw:pt-10': index > 0 && !dense, ' tw:pt-4': index > 0 && dense }"
        >
          <!-- Section Title -->
          <div v-if="isEditingTitle(section.id)" class="tw:flex tw:items-center tw:gap-2 tw:mb-4">
            <span class="tw:text-xl tw:font-bold tw:shrink-0">{{ index + 1 }}.</span>
            <BaseTextInput
              v-model="section.title"
              size="sm"
              autofocus
              class="tw:flex-1"
              @blur="stopEditing"
              @keyup.enter="stopEditing"
            />
          </div>
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
            <IconPencil
              v-if="canUpdateVersion"
              :size="16"
              class="tw:opacity-0 tw:group-hover:opacity-100 tw:transition-opacity tw:text-primary/50"
            />
          </h3>

          <!-- Section Content -->
          <div
            class="tw:group tw:relative section-content"
            @click.prevent.stop="startEditingContent(section)"
          >
            <div class="tw:absolute tw:-top-5 tw:right-0">
              <IconPencil
                v-if="canUpdateVersion"
                :size="16"
                class="tw:opacity-0 tw:group-hover:opacity-100 tw:transition-opacity tw:text-primary/50"
              />
            </div>
            <TiptapEditor
              v-if="section.sectionType === 'text'"
              :key="`${section.id}-${isEditingContent(section.id)}`"
              v-model="section.content"
              :editable="isEditingContent(section.id)"
              contentType="json"
              class="tw:border-0! tw:min-h-fit!"
              :class="{ 'tw:cursor-pointer': canEdit && !isEditingContent(section.id) }"
            />

            <BaseUploader
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
              <IconMessageCheck :size="16" class="tw:text-primary" />
              <span class="tw:text-xs tw:font-semibold tw:text-primary">Your Comment</span>
              <IconLoader2
                v-if="savingComment[section.id]"
                :size="14"
                class="tw:text-secondary tw:animate-spin"
              />
            </div>
            <BaseTextarea
              v-model="sectionCommentText[section.id]"
              :rows="2"
              placeholder="Add feedback for this section..."
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
              <IconMessageExclamation :size="16" class="tw:text-orange-600" />
              <span class="tw:text-xs tw:font-semibold tw:text-orange-700 tw:dark:text-orange-400">
                Reviewer Feedback —
                <UserBadgeById :userId="getReviewerComment(section.id).userId" />
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
        <BaseEmptyState
          v-if="documentSections.length === 0"
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
          <BaseButton variant="outline" class="tw:w-full" @click="openAddSectionDialog">
            <template #icon>
              <IconPlus :size="20" />
            </template>
            Add Section
          </BaseButton>
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

<script setup>
import { isAllowed, currentSession } from '@/utils/currentSession.js'
import {
  IconPencil,
  IconMessageCheck,
  IconMessageExclamation,
  IconLoader2,
} from '@tabler/icons-vue'

const props = defineProps({
  sectionId: {
    type: String,
    required: true,
  },
  documentVersionId: {
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

const section = useLiveQueryWithDeps(
  [() => props.sectionId],
  async (db, [id]) => db.DocumentSection.findByPk(id),
  { models: 'DocumentSection' },
)

const canUpdateSection = computed(
  () => props.canEdit && section.value && isAllowed(['documents:update']),
)

// ── Editing state ───────────────────────────────────────────────
const editingType = ref(/** @type {'title'|'content'|null} */ (null))

function startEditingTitle() {
  if (!canUpdateSection.value) return
  editingType.value = 'title'
}

function startEditingContent() {
  if (!canUpdateSection.value) return
  editingType.value = 'content'
}

function stopEditing() {
  editingType.value = null
}

useEventListener('click', (event) => {
  if (event.target.closest('[role="dialog"]')) return
  stopEditing()
})

// ── Debounced save ──────────────────────────────────────────────
const debouncedSave = useDebounceFn(async () => {
  if (canUpdateSection.value && section.value) {
    section.value.updatedBy = currentSession.value?.userId || null
    await section.value.save()
  }
}, 500)

watch(
  section,
  () => {
    if (editingType.value) debouncedSave()
  },
  { deep: true },
)

// ── Reviewer comments ───────────────────────────────────────────
const rejectedTask = useLiveQueryWithDeps(
  [() => props.documentVersionId],
  async (db, [versionId]) => {
    if (!versionId) return null
    return db.TaskInstance.where('[entityType+entityId]', ['DocumentVersion', versionId])
      .where('statusId', 'REJECTED')
      .first()
  },
)

const reviewerComment = useLiveQueryWithDeps(
  [() => props.sectionId, () => rejectedTask.value?.assignedTo, () => props.reviewMode],
  async (db, [sectionId, reviewerUserId, isReview]) => {
    if (!isReview && !reviewerUserId) return null
    return db.Comment.where('[objectType+objectId]', ['DocumentSection', sectionId])
      .where('userId', reviewerUserId || currentSession.value?.userId)
      .first()
  },
  { models: 'Comment' },
)

const commentText = ref('')
const savingComment = ref(false)

watch(
  reviewerComment,
  (comment) => {
    if (comment && !commentText.value) {
      commentText.value = comment.body
    }
  },
  { immediate: true },
)

const debouncedSaveComment = useDebounceFn(async () => {
  const text = commentText.value?.trim()
  const existing = reviewerComment.value

  savingComment.value = true
  try {
    if (existing && text) {
      existing.body = text
      await existing.save()
    } else if (!existing && text) {
      const create = useLiveMutation(async (db) => {
        const comment = db.Comment.create({
          body: text,
          objectType: 'DocumentSection',
          objectId: props.sectionId,
        })
        await comment.save()
      })
      await create()
    }
  } finally {
    savingComment.value = false
  }
}, 800)
</script>

<template>
  <div v-if="section" class="tw:break-inside-avoid">
    <!-- Section Title -->
    <div v-if="editingType === 'title'" class="tw:flex tw:items-center tw:gap-2 tw:mb-4">
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
        dense ? 'tw:text-base' : 'tw:text-xl',
        { 'tw:cursor-pointer tw:px-2 tw:-mx-2 tw:group': canEdit },
      ]"
      @click.prevent.stop="startEditingTitle"
    >
      <span>{{ section.order + 1 }}.</span>
      <span>{{ section.title }}</span>
      <IconPencil
        v-if="canUpdateSection"
        :size="16"
        class="tw:opacity-0 tw:group-hover:opacity-100 tw:transition-opacity tw:text-primary/50"
      />
    </h3>

    <!-- Section Content -->
    <div class="tw:group tw:relative section-content" @click.prevent.stop="startEditingContent">
      <div class="tw:absolute tw:-top-5 tw:right-0">
        <IconPencil
          v-if="canUpdateSection"
          :size="16"
          class="tw:opacity-0 tw:group-hover:opacity-100 tw:transition-opacity tw:text-primary/50"
        />
      </div>

      <TiptapEditor
        v-if="section.sectionType === 'text'"
        :key="`${section.id}-${editingType === 'content'}`"
        v-model="section.content"
        :editable="editingType === 'content'"
        class="tw:border-0! tw:min-h-fit!"
        :class="{ 'tw:cursor-pointer': canEdit && editingType !== 'content' }"
      />

      <BaseUploader
        v-if="section.sectionType === 'attachment'"
        v-model="section.attachments"
        :readonly="editingType !== 'content'"
        hideHeader
        class="tw:border-0 tw:shadow-none! tw:p-0"
        :class="{ 'tw:cursor-pointer': canEdit && editingType !== 'content' }"
      />
    </div>

    <!-- Reviewer Inline Comment (review mode — editable) -->
    <div v-if="reviewMode" class="tw:mt-4">
      <div class="tw:flex tw:items-center tw:gap-2 tw:mb-1">
        <IconMessageCheck :size="16" class="tw:text-primary" />
        <span class="tw:text-xs tw:font-semibold tw:text-primary">Your Comment</span>
        <IconLoader2 v-if="savingComment" :size="14" class="tw:text-secondary tw:animate-spin" />
      </div>
      <BaseTextarea
        v-model="commentText"
        :rows="2"
        placeholder="Add feedback for this section..."
        class="tw:text-sm"
        @update:modelValue="debouncedSaveComment"
      />
    </div>

    <!-- Owner Feedback Display (read-only — shown when rejected) -->
    <div
      v-else-if="reviewerComment"
      class="tw:mt-4 tw:rounded-lg tw:border tw:border-orange-200 tw:bg-orange-50 tw:dark:bg-orange-950/20 tw:dark:border-orange-800 tw:p-3"
    >
      <div class="tw:flex tw:items-center tw:gap-2 tw:mb-1">
        <IconMessageExclamation :size="16" class="tw:text-orange-600" />
        <span class="tw:text-xs tw:font-semibold tw:text-orange-700 tw:dark:text-orange-400">
          Reviewer Feedback —
          <UserBadgeById :userId="reviewerComment.userId" />
        </span>
      </div>
      <p
        class="tw:text-sm tw:text-orange-800 tw:dark:text-orange-300 tw:mb-0! tw:whitespace-pre-wrap"
      >
        {{ reviewerComment.body }}
      </p>
    </div>
  </div>
</template>

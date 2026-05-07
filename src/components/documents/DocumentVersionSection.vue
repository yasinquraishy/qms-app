<script setup>
import { isAllowed, currentSession } from '@/utils/currentSession.js'
import { IconMessageCheck, IconMessageExclamation, IconLoader2 } from '@tabler/icons-vue'

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
  index: {
    type: Number,
    default: 0,
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

// ── Auto-save on any change while the section is editable ──────
const isFirstLoad = ref(true)

const debouncedSave = useDebounceFn(async () => {
  if (canUpdateSection.value && section.value) {
    section.value.updatedBy = currentSession.value?.userId || null
    await section.value.save()
  }
}, 500)

watch(
  section,
  () => {
    if (isFirstLoad.value) {
      isFirstLoad.value = false
      return
    }
    if (canUpdateSection.value) debouncedSave()
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
    <div v-if="canUpdateSection" class="tw:flex tw:items-center tw:gap-2 tw:mb-4">
      <span>{{ index + 1 }}.</span>
      <BaseTextInput v-model="section.title" size="sm" class="tw:flex-1" />
    </div>
    <h3
      v-else
      class="tw:font-bold tw:flex tw:items-center tw:gap-2"
      :class="dense ? 'tw:text-base' : 'tw:text-xl'"
    >
      <span>{{ index + 1 }}.</span>
      <span>{{ section.title }}</span>
    </h3>

    <!-- Section Content -->
    <div class="section-content">
      <TiptapEditor
        v-if="section.sectionType === 'text'"
        v-model="section.content"
        :editable="canUpdateSection"
        class="tw:border-0! tw:min-h-fit!"
      />

      <BaseUploader
        v-if="section.sectionType === 'attachment'"
        v-model="section.attachments"
        :readonly="!canUpdateSection"
        hideHeader
        class="tw:border-0 tw:shadow-none! tw:p-0"
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

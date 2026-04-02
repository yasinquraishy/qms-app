<script setup>
import { useQuasar } from 'quasar'
import { useDocuments } from '@/composables/useDocuments.js'

const props = defineProps({
  document: {
    type: Object,
    required: true,
  },
  currentVersion: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['updated'])

const open = defineModel({
  type: Boolean,
  default: false,
})

const { updateDocument, updateVersion } = useDocuments()
const $q = useQuasar()

// Form state
const editForm = ref({
  departmentId: null,
  statusId: null,
  effectiveDate: null,
  workflowVersionId: null,
  tags: [],
  relatedStandardId: null,
  periodicReviewMonths: 12,
  autoEffectiveOnApproval: true,
})

const newTag = ref('')
const isSubmitting = ref(false)

// Load document data when dialog opens
watch(
  open,
  async (val) => {
    if (val) {
      editForm.value = {
        departmentId: props.document.departmentId,
        statusId: props.document.statusId,
        effectiveDate: props.currentVersion?.effectiveDate || null,
        workflowVersionId: props.document.workflowVersionId || null,
        tags: props.document.tags || [],
        relatedStandardId: props.document.relatedStandardId || null,
        periodicReviewMonths: props.document.periodicReviewMonths ?? 12,
        autoEffectiveOnApproval: props.document.autoEffectiveOnApproval ?? true,
      }
    } else {
      newTag.value = ''
    }
  },
  { immediate: true },
)

// Tags management
function addTag() {
  const tag = newTag.value.trim().toUpperCase()
  if (tag && !editForm.value.tags.includes(tag)) {
    editForm.value.tags.push(tag)
    newTag.value = ''
  }
}

function removeTag(index) {
  editForm.value.tags.splice(index, 1)
}

// Submit handler
async function onSubmit() {
  isSubmitting.value = true
  try {
    const updateData = {
      departmentId: editForm.value.departmentId,
      statusId: editForm.value.statusId,
      workflowVersionId: editForm.value.workflowVersionId,
      relatedStandardId: editForm.value.relatedStandardId,
      periodicReviewMonths: editForm.value.periodicReviewMonths,
      autoEffectiveOnApproval: editForm.value.autoEffectiveOnApproval,
    }

    const result = await updateDocument(props.document.id, updateData)
    const versionResult = await updateVersion(props.document.id, props.currentVersion.id, {
      effectiveDate: editForm.value.effectiveDate,
      tags: editForm.value.tags,
    })

    if (result.error) {
      $q.notify({ type: 'negative', message: result.error })
      return
    }

    $q.notify({ type: 'positive', message: 'Document updated successfully' })
    emit('updated', result.document, versionResult.version)
    open.value = false
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <WDialog v-model="open" title="Edit Document Properties">
    <div class="tw:space-y-6">
      <!-- Document Details -->
      <section class="tw:space-y-4">
        <h3 class="ds-label tw:text-secondary">Document Details</h3>
        <div class="tw:grid tw:grid-cols-1 tw:md:grid-cols-2 tw:gap-4">
          <!-- Department -->
          <div>
            <DocumentsDepartmentSelect
              v-model:departmentId="editForm.departmentId"
              label="Department"
              hideBottomSpace
              required
            />
          </div>

          <!-- Effective Date -->
          <div>
            <WDateTimeInput
              v-model="editForm.effectiveDate"
              label="Effective Date"
              mode="date"
              outlined
              dense
              hideBottomSpace
            />
          </div>

          <!-- Related Standard -->
          <div>
            <DocumentsRelatedStandardSelect
              v-model:relatedStandardId="editForm.relatedStandardId"
              label="Related Standard"
              hideBottomSpace
            />
          </div>
        </div>

        <!-- Review Settings -->
        <div class="tw:flex tw:flex-col tw:md:flex-row tw:md:items-center tw:gap-6 tw:mt-4">
          <div class="tw:space-y-2">
            <label class="tw:text-sm tw:font-semibold tw:text-on-sidebar">Periodic Review</label>
            <div class="tw:flex tw:items-center tw:gap-3">
              <div
                class="tw:flex tw:items-center tw:border tw:border-divider tw:rounded-xl tw:overflow-hidden tw:bg-sidebar-hover"
              >
                <button
                  class="tw:px-3 tw:py-2 tw:hover:bg-sidebar tw:text-secondary"
                  @click="
                    editForm.periodicReviewMonths = Math.max(1, editForm.periodicReviewMonths - 1)
                  "
                >
                  <WIcon name="remove" size="18px" />
                </button>
                <input
                  v-model.number="editForm.periodicReviewMonths"
                  class="tw:w-16 tw:text-center tw:bg-transparent tw:border-none tw:focus:ring-0 tw:text-sm tw:font-bold tw:outline-none"
                  type="number"
                  min="1"
                />
                <button
                  class="tw:px-3 tw:py-2 tw:hover:bg-sidebar tw:text-secondary"
                  @click="editForm.periodicReviewMonths++"
                >
                  <WIcon name="add" size="18px" />
                </button>
              </div>
              <span class="tw:text-sm tw:font-medium tw:text-secondary">months</span>
            </div>
          </div>
          <div
            class="tw:flex tw:items-center tw:gap-4 tw:py-3 tw:px-5 tw:bg-sidebar-hover tw:rounded-2xl tw:border tw:border-divider/50"
          >
            <div class="tw:space-y-0.5">
              <p class="tw:text-sm tw:font-bold tw:text-on-sidebar">Auto-effective on approval</p>
              <p class="tw:text-xs tw:text-secondary">Skip manual release after final approval</p>
            </div>
            <QToggle v-model="editForm.autoEffectiveOnApproval" color="primary" />
          </div>
        </div>
      </section>

      <!-- Metadata Tags -->
      <section class="tw:space-y-4">
        <h3 class="ds-label tw:text-secondary">Metadata Tags</h3>
        <div
          class="tw:flex tw:flex-wrap tw:gap-2 tw:p-3 tw:bg-sidebar-hover tw:border tw:border-divider tw:rounded-xl"
        >
          <span
            v-for="(tag, index) in editForm.tags"
            :key="index"
            class="tw:inline-flex tw:items-center tw:gap-1 tw:bg-primary/10 tw:text-primary tw:text-xs tw:font-bold tw:px-3 tw:py-1.5 tw:rounded-full tw:border tw:border-primary/20"
          >
            {{ tag }}
            <button class="tw:hover:text-primary-dark" @click="removeTag(index)">
              <WIcon name="close" size="14px" />
            </button>
          </span>
          <input
            v-model="newTag"
            class="tw:bg-transparent tw:border-none tw:focus:ring-0 tw:text-sm tw:py-0 tw:h-auto tw:w-32 tw:placeholder:text-secondary tw:outline-none"
            placeholder="Add tag..."
            type="text"
            @keyup.enter="addTag"
          />
        </div>
      </section>

      <!-- Approval Workflow -->
      <section class="tw:space-y-4">
        <h3 class="ds-label tw:text-secondary">Approval Workflow</h3>
        <DocumentsWorkflowVersionSelect v-model="editForm.workflowVersionId" />
      </section>
    </div>

    <template #actions>
      <WBtn flat label="Cancel" color="primary" @click="open = false" />
      <WBtn
        label="Save Changes"
        color="primary"
        unelevated
        :loading="isSubmitting"
        @click="onSubmit"
      />
    </template>
  </WDialog>
</template>

<script setup>
import {
  IconFileText,
  IconMapPin,
  IconHierarchy,
  IconAdjustments,
  IconMinus,
  IconPlus,
  IconX,
} from '@tabler/icons-vue'

const form = defineModel({
  type: Object,
  required: true,
})

const selectedTemplate = defineModel('selectedTemplate', {
  type: [Object, null],
  default: null,
})

// Resolve template object from ID via SyncEngine
const resolvedTemplate = useLiveQueryWithDeps(
  [() => form.value.documentTemplateId],
  async (db, [templateId]) => {
    if (!templateId) return null
    return db.DocumentTemplate.findByPk(templateId)
  },
  { initial: null },
)

watch(resolvedTemplate, (template) => {
  selectedTemplate.value = template
  if (!template) return
  form.value.prefix = template.prefix
  form.value.relatedStandardId = template.relatedStandardId
  form.value.periodicReviewMonths = template.periodicReviewMonths
  form.value.autoEffectiveOnApproval = template.autoEffectiveOnApproval
})

// Prefix auto-uppercase
const prefix = computed({
  get: () => form.value.prefix,
  set: (value) => {
    form.value.prefix = value.toUpperCase()
  },
})

// Tags management
const newTag = ref('')

function addTag() {
  const tag = newTag.value.trim().toUpperCase()
  if (tag && !form.value.tags.includes(tag)) {
    form.value.tags.push(tag)
    newTag.value = ''
  }
}

function removeTag(index) {
  form.value.tags.splice(index, 1)
}

function incrementReviewMonths() {
  form.value.periodicReviewMonths++
}

function decrementReviewMonths() {
  if (form.value.periodicReviewMonths > 1) {
    form.value.periodicReviewMonths--
  }
}
</script>

<template>
  <div class="tw:space-y-6">
    <!-- Document Details Section -->
    <section class="tw:bg-sidebar tw:rounded-2xl tw:shadow-sm tw:border tw:border-divider tw:p-8">
      <div class="tw:flex tw:items-center tw:gap-2 tw:mb-6">
        <IconFileText class="tw:text-primary tw:size-5" />
        <h2 class="tw:text-xl tw:font-bold tw:text-on-sidebar">Document Details</h2>
      </div>
      <div class="tw:grid tw:grid-cols-1 tw:md:grid-cols-2 tw:gap-6">
        <!-- Document Type -->
        <div class="tw:space-y-2">
          <label class="tw:text-sm tw:font-medium tw:text-secondary">Document Type *</label>
          <DocumentTypeSelectMenu v-model="form.documentTypeId" :required="true" />
        </div>

        <!-- Document Template -->
        <div class="tw:space-y-2">
          <label class="tw:text-sm tw:font-medium tw:text-secondary">Document Template</label>
          <DocumentTemplateSelectMenu v-model="form.documentTemplateId" />
        </div>

        <!-- Document Title -->
        <div class="tw:space-y-2">
          <BaseTextInput
            v-model="form.title"
            name="title"
            label="Document Title *"
            placeholder="e.g. Clean Room Sterilization Protocol"
            :required="true"
          />
        </div>

        <!-- Department -->
        <div class="tw:space-y-2">
          <label class="tw:text-sm tw:font-medium tw:text-secondary">Department *</label>
          <DepartmentSelectMenu v-model="form.departmentId" :required="true" />
        </div>

        <!-- Effective Date -->
        <div class="tw:space-y-2">
          <label class="tw:text-sm tw:font-medium tw:text-secondary">Effective Date</label>
          <BaseDatePicker v-model="form.effectiveDate" />
        </div>

        <!-- Tags -->
        <div class="tw:md:col-span-2 tw:space-y-3">
          <label class="tw:text-sm tw:font-semibold tw:text-on-sidebar">Tags</label>
          <div
            class="tw:flex tw:flex-wrap tw:gap-2 tw:p-3 tw:bg-sidebar-hover tw:border tw:border-divider tw:rounded-xl"
          >
            <span
              v-for="(tag, index) in form.tags"
              :key="index"
              class="tw:inline-flex tw:items-center tw:gap-1 tw:bg-primary/10 tw:text-primary tw:text-xs tw:font-bold tw:px-3 tw:py-1.5 tw:rounded-full tw:border tw:border-primary/20"
            >
              {{ tag }}
              <button class="tw:hover:text-primary-dark" @click="removeTag(index)">
                <IconX :size="14" />
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
        </div>
      </div>
    </section>

    <!-- Site Availability -->
    <section class="tw:bg-sidebar tw:rounded-2xl tw:shadow-sm tw:border tw:border-divider tw:p-8">
      <div class="tw:flex tw:items-center tw:gap-2 tw:mb-6">
        <IconMapPin class="tw:text-primary tw:size-5" />
        <h2 class="tw:text-xl tw:font-bold tw:text-on-sidebar">Site Availability</h2>
      </div>
      <div class="tw:max-w-2xl">
        <label>Site *</label>
        <SiteSelectMenu v-model="form.siteId" :required="true" />
        <p class="tw:text-xs tw:text-secondary tw:mt-2">
          Select which site this document will be available at.
        </p>
      </div>
    </section>

    <!-- Workflow Setup Section -->
    <section class="tw:bg-sidebar tw:rounded-2xl tw:shadow-sm tw:border tw:border-divider tw:p-8">
      <div class="tw:flex tw:items-center tw:gap-2 tw:mb-6">
        <IconHierarchy class="tw:text-primary tw:size-5" />
        <h2 class="tw:text-xl tw:font-bold tw:text-on-sidebar">Workflow Setup</h2>
      </div>

      <DocumentsWorkflowVersionSelect v-model="form.workflowVersionId" />
    </section>

    <!-- Advanced Settings Section -->
    <section class="tw:bg-sidebar tw:rounded-2xl tw:shadow-sm tw:border tw:border-divider tw:p-8">
      <div class="tw:flex tw:items-center tw:gap-2 tw:mb-6">
        <IconAdjustments class="tw:text-primary tw:size-5" />
        <h2 class="tw:text-xl tw:font-bold tw:text-on-sidebar">Advanced Settings</h2>
      </div>

      <div class="tw:grid tw:grid-cols-1 tw:md:grid-cols-2 tw:gap-6">
        <div class="tw:space-y-2">
          <BaseTextInput
            v-model="prefix"
            name="prefix"
            label="Document Prefix *"
            placeholder="e.g. SOP, DOC-{SITE_CODE}"
            :required="true"
          />
          <p class="tw:text-xs tw:text-secondary tw:italic">
            Supports placeholders: {SITE_CODE}, {DEPARTMENT_CODE} (e.g. "DOC", "SOP-{SITE_CODE}",
            "DOC-{SITE_CODE}-{DEPARTMENT_CODE}").
          </p>
        </div>

        <!-- Related Standard -->
        <div class="tw:space-y-2">
          <label class="tw:text-sm tw:font-medium tw:text-secondary">Related Standard</label>
          <RelatedStandardSelectMenu v-model="form.relatedStandardId" />
        </div>

        <!-- Periodic Review Frequency -->
        <div class="tw:space-y-3">
          <label class="tw:text-sm tw:font-semibold tw:text-on-sidebar"
            >Periodic Review Frequency</label
          >
          <div class="tw:flex tw:items-center tw:gap-3">
            <div
              class="tw:flex tw:items-center tw:border tw:border-divider tw:rounded-xl tw:overflow-hidden tw:bg-sidebar-hover"
            >
              <button
                class="tw:px-3 tw:py-2 tw:hover:bg-sidebar tw:text-secondary"
                @click="decrementReviewMonths"
              >
                <IconMinus :size="18" />
              </button>
              <input
                v-model.number="form.periodicReviewMonths"
                name="periodicReviewMonths"
                class="tw:w-16 tw:text-center tw:bg-transparent tw:border-none tw:focus:ring-0 tw:text-sm tw:font-bold tw:outline-none"
                type="number"
                min="1"
              />
              <button
                class="tw:px-3 tw:py-2 tw:hover:bg-sidebar tw:text-secondary"
                @click="incrementReviewMonths"
              >
                <IconPlus :size="18" />
              </button>
            </div>
            <span class="tw:text-sm tw:font-medium tw:text-secondary">months</span>
          </div>
        </div>

        <!-- Auto Effective on Approval -->
        <div
          class="tw:flex tw:items-center tw:gap-4 tw:py-4 tw:px-6 tw:bg-sidebar-hover tw:rounded-2xl tw:border tw:border-divider/50"
        >
          <div class="tw:space-y-0.5">
            <p class="tw:text-sm tw:font-bold tw:text-on-sidebar">Automatically make effective</p>
            <p class="tw:text-xs tw:text-secondary">Skip manual release after final approval</p>
          </div>
          <BaseSwitch v-model="form.autoEffectiveOnApproval" />
        </div>
      </div>
    </section>
  </div>
</template>

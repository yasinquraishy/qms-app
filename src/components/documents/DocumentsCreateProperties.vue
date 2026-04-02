<script setup>
const form = defineModel({
  type: Object,
  required: true,
})

const selectedTemplate = defineModel('selectedTemplate', {
  type: [Object, null],
  default: null,
})

watch(selectedTemplate, (template) => {
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
        <WIcon name="description" class="tw:text-primary" />
        <h2 class="tw:text-xl tw:font-bold tw:text-on-sidebar">Document Details</h2>
      </div>
      <div class="tw:grid tw:grid-cols-1 tw:md:grid-cols-2 tw:gap-6">
        <!-- Document Type -->
        <div class="tw:space-y-2">
          <DocumentsDocumentTypeSelect
            v-model:documentTypeId="form.documentTypeId"
            name="documentTypeId"
            required
            label="Document Type *"
            hideBottomSpace
          />
        </div>

        <!-- Document Template -->
        <div class="tw:space-y-2">
          <DocumentsDocumentTemplateSelect
            v-model:documentTemplateId="form.documentTemplateId"
            v-model:documentTemplate="selectedTemplate"
            name="documentTemplateId"
            label="Document Template"
            nullLabel="N/A"
            hideBottomSpace
          />
        </div>

        <!-- Document Title -->
        <div class="tw:space-y-2">
          <WInput
            v-model="form.title"
            name="title"
            label="Document Title *"
            placeholder="e.g. Clean Room Sterilization Protocol"
            outlined
            dense
            hideBottomSpace
          />
        </div>

        <!-- Department -->
        <div class="tw:space-y-2">
          <DocumentsDepartmentSelect
            v-model:departmentId="form.departmentId"
            label="Department"
            hideBottomSpace
            required
          />
        </div>

        <!-- Effective Date -->
        <div class="tw:space-y-2">
          <WDateTimeInput
            v-model="form.effectiveDate"
            label="Effective Date"
            mode="date"
            outlined
            dense
            hideBottomSpace
          />
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
        </div>
      </div>
    </section>

    <!-- Site Availability -->
    <section class="tw:bg-sidebar tw:rounded-2xl tw:shadow-sm tw:border tw:border-divider tw:p-8">
      <div class="tw:flex tw:items-center tw:gap-2 tw:mb-6">
        <WIcon name="location_on" class="tw:text-primary" />
        <h2 class="tw:text-xl tw:font-bold tw:text-on-sidebar">Site Availability</h2>
      </div>
      <div class="tw:max-w-2xl">
        <DocumentsSiteSelect
          v-model:siteId="form.siteId"
          name="siteId"
          :required="true"
          label="Site *"
          hideBottomSpace
        />
        <p class="tw:text-xs tw:text-secondary tw:mt-2">
          Select which site this document will be available at.
        </p>
      </div>
    </section>

    <!-- Workflow Setup Section -->
    <section class="tw:bg-sidebar tw:rounded-2xl tw:shadow-sm tw:border tw:border-divider tw:p-8">
      <div class="tw:flex tw:items-center tw:gap-2 tw:mb-6">
        <WIcon name="account_tree" class="tw:text-primary" />
        <h2 class="tw:text-xl tw:font-bold tw:text-on-sidebar">Workflow Setup</h2>
      </div>

      <DocumentsWorkflowVersionSelect v-model="form.workflowVersionId" />
    </section>

    <!-- Advanced Settings Section -->
    <section class="tw:bg-sidebar tw:rounded-2xl tw:shadow-sm tw:border tw:border-divider tw:p-8">
      <div class="tw:flex tw:items-center tw:gap-2 tw:mb-6">
        <WIcon name="tune" class="tw:text-primary" />
        <h2 class="tw:text-xl tw:font-bold tw:text-on-sidebar">Advanced Settings</h2>
      </div>

      <div class="tw:grid tw:grid-cols-1 tw:md:grid-cols-2 tw:gap-6">
        <div class="tw:space-y-2">
          <WInput
            v-model="prefix"
            name="prefix"
            label="Document Prefix *"
            placeholder="e.g. SOP, DOC-{SITE_CODE}"
            outlined
            dense
          >
            <template #hint>
              <span class="tw:text-xs tw:text-secondary tw:italic">
                Supports placeholders: {SITE_CODE}, {DEPARTMENT_CODE} (e.g. "DOC",
                "SOP-{SITE_CODE}", "DOC-{SITE_CODE}-{DEPARTMENT_CODE}").
              </span>
            </template>
          </WInput>
        </div>

        <!-- Related Standard -->
        <div class="tw:space-y-2">
          <DocumentsRelatedStandardSelect
            v-model:relatedStandardId="form.relatedStandardId"
            label="Related Standard"
            nullLabel="N/A"
            hideBottomSpace
          />
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
                <WIcon name="remove" size="18px" />
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
                <WIcon name="add" size="18px" />
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
          <QToggle v-model="form.autoEffectiveOnApproval" color="primary" />
        </div>
      </div>
    </section>
  </div>
</template>

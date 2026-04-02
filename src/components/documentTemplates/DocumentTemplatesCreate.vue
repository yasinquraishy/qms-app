<script setup>
import { useQuasar } from 'quasar'
import { required, minValue, helpers } from '@vuelidate/validators'
import { useDocumentTemplates } from '@/composables/useDocumentTemplates.js'
import { getCompanyPath } from '@/utils/routeHelpers.js'
import { validateUUID } from '@/utils/validators.js'

const props = defineProps({
  id: {
    type: String,
    default: null,
  },
})

const router = useRouter()
const $q = useQuasar()
const {
  createDocumentTemplate,
  updateDocumentTemplate,
  fetchDocumentTemplate,
  checkPrefixAvailability,
} = useDocumentTemplates()

const saving = ref(false)
const loading = ref(false)
const checkingPrefix = ref(false)
const prefixAvailable = ref(null)
const originalPrefix = ref(null)

// Form data
const form = ref({
  name: '',
  prefix: '',
  departmentId: null,
  relatedStandardId: null,
  trainingAvailable: true,
  retrainingOnVersion: true,
  periodicReviewMonths: 12,
  reviewLimitDays: 14,
  approvalLimitDays: 7,
  autoEffectiveOnApproval: true,
  showSectionTitles: true,
  sections: [
    {
      id: crypto.randomUUID(),
      order: 1,
      title: 'Purpose',
      sectionType: 'text',
    },
  ],
})

const prefix = computed({
  get: () => form.value.prefix,
  set: (value) => {
    form.value.prefix = value.toUpperCase()
  },
})

// Validation rules
const rules = computed(() => ({
  name: {
    required: helpers.withMessage('Template name is required', required),
  },
  prefix: {
    required: helpers.withMessage('Document prefix is required', required),
    validFormat: helpers.withMessage(
      'Only uppercase letters, numbers, hyphens, and placeholders {SITE_CODE}, {DEPARTMENT_CODE} are allowed',
      (value) => /^[A-Z0-9{}\-_]+$/.test(value) && /[A-Z0-9}]$/.test(value),
    ),
    validPlaceholders: helpers.withMessage(
      'Only {SITE_CODE} and {DEPARTMENT_CODE} placeholders are supported',
      (value) => {
        const placeholders = [...value.matchAll(/\{([A-Z_]+)\}/g)].map((m) => m[1])
        return placeholders.every((p) => ['SITE_CODE', 'DEPARTMENT_CODE'].includes(p))
      },
    ),
    noDuplicatePlaceholders: helpers.withMessage(
      'Each placeholder can only be used once',
      (value) => {
        const placeholders = [...value.matchAll(/\{([A-Z_]+)\}/g)].map((m) => m[1])
        return new Set(placeholders).size === placeholders.length
      },
    ),
    noUnmatchedBraces: helpers.withMessage(
      'Invalid placeholder format - check your curly braces',
      (value) => {
        const stripped = value.replace(/\{[A-Z_]+\}/g, '')
        return !stripped.includes('{') && !stripped.includes('}')
      },
    ),
  },
  periodicReviewMonths: {
    required: helpers.withMessage('Periodic review period is required', required),
    minValue: helpers.withMessage('Must be at least 1 month', minValue(1)),
  },
  reviewLimitDays: {
    required: helpers.withMessage('Review limit is required', required),
    minValue: helpers.withMessage('Must be at least 1 day', minValue(1)),
  },
  approvalLimitDays: {
    required: helpers.withMessage('Approval limit is required', required),
    minValue: helpers.withMessage('Must be at least 1 day', minValue(1)),
  },
  sections: {
    minLength: helpers.withMessage(
      'At least one section is required',
      (value) => value && value.length > 0,
    ),
    hasValidSections: helpers.withMessage('All sections must have a title', (value) => {
      if (!value || value.length === 0) return true
      return value.every((section) => section.title && section.title.trim().length > 0)
    }),
  },
}))

// Setup validator
const validator = useValidator(rules, form)

// Computed properties
const isEditMode = computed(() => validateUUID(props.id))
const pageTitle = computed(() =>
  isEditMode.value ? 'Edit Document Template' : 'Create Document Template',
)

// Load template data if editing
onMounted(async () => {
  if (isEditMode.value) {
    loading.value = true
    const result = await fetchDocumentTemplate(props.id)
    loading.value = false

    if (result.error) {
      $q.notify({ type: 'negative', message: result.error })
      goBack()
      return
    }

    const template = result.documentTemplate
    originalPrefix.value = template.prefix
    form.value = template
    // Mark prefix as available since it's the current template's prefix
    prefixAvailable.value = true
  }
})

// Watch prefix changes and check availability
async function checkPrefix(prefix) {
  if (!prefix || prefix.length < 2) {
    prefixAvailable.value = null
    return
  }

  // Skip check if editing and prefix hasn't changed
  if (isEditMode.value && prefix === originalPrefix.value) {
    prefixAvailable.value = true
    return
  }

  checkingPrefix.value = true
  const result = await checkPrefixAvailability(prefix)
  prefixAvailable.value = result.available
  checkingPrefix.value = false
}

const debouncedCheckPrefix = useDebounceFn(checkPrefix, 500)

watch(() => form.value.prefix, debouncedCheckPrefix)

async function saveTemplate() {
  // Validate form fields using Vuelidate
  const isValid = await validator.value.$validate()

  if (!isValid) {
    $q.notify({
      type: 'warning',
      message: 'Please fix the validation errors before saving',
    })
    return
  }

  // Check prefix availability (async validation)
  if (prefixAvailable.value === false) {
    $q.notify({ type: 'warning', message: 'Document prefix already exists' })
    return
  }

  saving.value = true
  try {
    let result
    if (isEditMode.value) {
      result = await updateDocumentTemplate(props.id, form.value)
    } else {
      result = await createDocumentTemplate(form.value)
    }

    if (result.error) {
      $q.notify({ type: 'negative', message: result.error })
    } else {
      $q.notify({
        type: 'positive',
        message: isEditMode.value
          ? 'Document template updated successfully'
          : 'Document template created successfully',
      })
      router.push(getCompanyPath('/document-templates'))
    }
  } finally {
    saving.value = false
  }
}

function goBack() {
  router.push(getCompanyPath('/document-templates'))
}

function discardChanges() {
  $q.dialog({
    title: 'Discard Changes',
    message: 'Are you sure you want to discard all changes?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    goBack()
  })
}
</script>

<template>
  <div class="tw:flex tw:flex-col tw:h-full">
    <SafeTeleport to="#main-header-title">
      <div class="tw:flex tw:items-center tw:gap-2 tw:text-on-sidebar">
        <WIcon icon="description" class="tw:text-primary" size="24px" />
        <h2 class="tw:text-lg tw:font-bold tw:tracking-tight tw:text-nowrap">
          {{ pageTitle }}
        </h2>
      </div>
    </SafeTeleport>

    <!-- Loading overlay -->
    <div v-if="loading" class="tw:flex tw:items-center tw:justify-center tw:h-full">
      <QSpinner color="primary" size="50px" />
    </div>

    <!-- Scrollable content -->
    <div v-else class="tw:flex-1 tw:overflow-y-auto tw:pb-24">
      <div class="tw:max-w-5xl tw:mx-auto tw:px-6 tw:py-8">
        <!-- Breadcrumbs & Header -->
        <div class="tw:mb-4 tw:flex tw:items-center tw:text-sm tw:text-secondary tw:gap-2">
          <span class="tw:cursor-pointer tw:hover:underline" @click="goBack">Templates List</span>
          <WIcon name="chevron_right" size="16px" />
          <span class="tw:text-on-sidebar tw:font-medium">{{
            isEditMode ? 'Edit' : 'Create'
          }}</span>
        </div>

        <div class="tw:mb-8">
          <h1 class="tw:text-3xl tw:font-black tw:text-on-sidebar tw:tracking-tight">
            {{ pageTitle }}
          </h1>
          <p class="tw:text-secondary tw:mt-2">
            Define the lifecycle, metadata, and structural components for your organization's formal
            documents.
          </p>
        </div>

        <!-- Form Sections -->
        <div class="tw:space-y-6">
          <!-- Section 1: Basic Information -->
          <WCard>
            <div
              class="tw:px-6 tw:py-4 tw:border-b tw:border-divider tw:flex tw:items-center tw:gap-2"
            >
              <WIcon name="info" class="tw:text-primary" size="22px" />
              <h2 class="tw:text-lg tw:font-bold tw:text-on-sidebar">Basic Information</h2>
            </div>
            <div class="tw:p-6 tw:grid tw:grid-cols-1 tw:md:grid-cols-2 tw:gap-6">
              <div>
                <WInput
                  v-model="form.name"
                  name="name"
                  label="Name"
                  placeholder="e.g. Standard Operating Procedure"
                  outlined
                  dense
                />
              </div>
              <div>
                <WInput
                  v-model="prefix"
                  name="prefix"
                  label="Document Prefix"
                  placeholder="DOC"
                  outlined
                  dense
                  :loading="checkingPrefix"
                >
                  <template #append>
                    <WIcon
                      v-if="prefixAvailable === true"
                      name="check_circle"
                      color="positive"
                      size="xs"
                    />
                    <WIcon
                      v-else-if="prefixAvailable === false"
                      name="cancel"
                      color="negative"
                      size="xs"
                    />
                  </template>
                  <template #hint>
                    <span class="tw:text-xs tw:text-secondary tw:italic">
                      Prefix for document numbers. Supports placeholders: {SITE_CODE},
                      {DEPARTMENT_CODE} (e.g. "DOC", "SOP-{SITE_CODE}",
                      "DOC-{SITE_CODE}-{DEPARTMENT_CODE}").
                    </span>
                  </template>
                </WInput>
              </div>
              <div>
                <DocumentsDepartmentSelect
                  v-model:departmentId="form.departmentId"
                  label="Department (Optional)"
                  :required="false"
                />
              </div>
              <div>
                <DocumentsRelatedStandardSelect
                  v-model:relatedStandardId="form.relatedStandardId"
                  label="Related Standard (Optional)"
                  nullLabel="Not Applicable"
                  :required="false"
                />
              </div>
            </div>
          </WCard>

          <!-- Section 2: Default Settings -->
          <WCard>
            <div
              class="tw:px-6 tw:py-4 tw:border-b tw:border-divider tw:flex tw:items-center tw:gap-2"
            >
              <WIcon name="settings" class="tw:text-primary" size="22px" />
              <h2 class="tw:text-lg tw:font-bold tw:text-on-sidebar">Default Settings</h2>
            </div>
            <div class="tw:p-6 tw:grid tw:grid-cols-1 tw:md:grid-cols-2 tw:gap-x-12 tw:gap-y-6">
              <div>
                <WSelect
                  v-model="form.trainingAvailable"
                  label="Training Available?"
                  :options="[
                    { label: 'Yes', value: true },
                    { label: 'No', value: false },
                  ]"
                  outlined
                  dense
                  hideBottomSpace
                  optionLabel="label"
                  optionValue="value"
                  emitValue
                  mapOptions
                />
              </div>

              <div>
                <WSelect
                  v-model="form.retrainingOnVersion"
                  label="Retraining Required on Each Version?"
                  :options="[
                    { label: 'Yes', value: true },
                    { label: 'No, only on major revisions', value: false },
                  ]"
                  outlined
                  dense
                  hideBottomSpace
                  optionLabel="label"
                  optionValue="value"
                  emitValue
                  mapOptions
                />
              </div>

              <div>
                <WInput
                  v-model.number="form.periodicReviewMonths"
                  name="periodicReviewMonths"
                  label="Periodic Review Period (months)"
                  type="number"
                  outlined
                  dense
                />
              </div>

              <div>
                <WInput
                  v-model.number="form.reviewLimitDays"
                  name="reviewLimitDays"
                  label="Review Limit (days)"
                  type="number"
                  outlined
                  dense
                />
              </div>

              <div>
                <WInput
                  v-model.number="form.approvalLimitDays"
                  name="approvalLimitDays"
                  label="Approval Limit (days)"
                  type="number"
                  outlined
                  dense
                />
              </div>

              <div>
                <WSelect
                  v-model="form.autoEffectiveOnApproval"
                  label="Automatically Make Effective on Approval?"
                  :options="[
                    { label: 'Yes', value: true },
                    { label: 'No, manual activation required', value: false },
                  ]"
                  outlined
                  dense
                  hideBottomSpace
                  optionLabel="label"
                  optionValue="value"
                  emitValue
                  mapOptions
                />
              </div>

              <div>
                <WSelect
                  v-model="form.showSectionTitles"
                  label="Show Text Section Titles?"
                  :options="[
                    { label: 'Yes, always show', value: true },
                    { label: 'No, hide titles', value: false },
                  ]"
                  outlined
                  dense
                  hideBottomSpace
                  optionLabel="label"
                  optionValue="value"
                  emitValue
                  mapOptions
                />
              </div>
            </div>
          </WCard>

          <!-- Section 3: Sections & Default Content Builder -->
          <SectionBuilder v-model="form.sections" title="Sections & Default Content Builder" />
        </div>
      </div>
    </div>

    <!-- Sticky Footer Action Bar -->
    <div
      class="tw:relative tw:bottom-0 tw:right-0 tw:w-full tw:lg:w-[calc(100%-16rem)] tw:bg-main/80 tw:backdrop-blur-md tw:border-t tw:border-divider tw:px-6 tw:py-4 tw:z-50"
    >
      <div class="tw:max-w-5xl tw:mx-auto tw:flex tw:items-center tw:justify-between">
        <div class="tw:flex tw:items-center tw:gap-2 tw:text-sm tw:text-secondary">
          <span class="tw:w-2 tw:h-2 tw:rounded-full tw:bg-warning tw:animate-pulse" />
          Unsaved changes
        </div>
        <div class="tw:flex tw:items-center tw:gap-4">
          <WBtn
            flat
            label="Discard Changes"
            color="secondary"
            :disable="saving"
            @click="discardChanges"
          />
          <WBtn
            :label="isEditMode ? 'Save Changes' : 'Create Template'"
            color="primary"
            icon="save"
            :loading="saving"
            @click="saveTemplate"
          />
        </div>
      </div>
    </div>
  </div>
</template>

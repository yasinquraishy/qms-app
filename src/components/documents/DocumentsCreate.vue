<script setup>
import { useQuasar } from 'quasar'
import { required, minValue, helpers } from '@vuelidate/validators'
import { useDocuments } from '@/composables/useDocuments.js'
import { getCompanyPath } from '@/utils/routeHelpers.js'

const router = useRouter()
const $q = useQuasar()
const { createDocument } = useDocuments()

const saving = ref(false)
const activeTab = ref('properties')
const selectedTemplate = ref(null)

const DEFAULT_FORM = {
  title: '',
  documentTypeId: null,
  documentTemplateId: null,
  departmentId: null,
  effectiveDate: null,
  sections: [],
  changeNotes: '',
  siteId: null,
  tags: [],
  approverIds: [],
  periodicReviewMonths: 12,
  autoEffectiveOnApproval: true,
  relatedStandardId: null,
  prefix: null,
}

// Form data
const form = ref({
  ...DEFAULT_FORM,
})

// Validation rules
const rules = computed(() => ({
  title: {
    required: helpers.withMessage('Document title is required', required),
  },
  documentTypeId: {
    required: helpers.withMessage('Document type is required', required),
  },
  prefix: {
    required: helpers.withMessage('Document prefix is required', required),
    validFormat: helpers.withMessage(
      'Only uppercase letters, numbers, hyphens, and placeholders {SITE_CODE}, {DEPARTMENT_CODE} are allowed',
      (value) => !value || (/^[A-Z0-9{}\-_]+$/.test(value) && /[A-Z0-9}]$/.test(value)),
    ),
    validPlaceholders: helpers.withMessage(
      'Only {SITE_CODE} and {DEPARTMENT_CODE} placeholders are supported',
      (value) => {
        if (!value) return true
        const placeholders = [...value.matchAll(/\{([A-Z_]+)\}/g)].map((m) => m[1])
        return placeholders.every((p) => ['SITE_CODE', 'DEPARTMENT_CODE'].includes(p))
      },
    ),
    noDuplicatePlaceholders: helpers.withMessage(
      'Each placeholder can only be used once',
      (value) => {
        if (!value) return true
        const placeholders = [...value.matchAll(/\{([A-Z_]+)\}/g)].map((m) => m[1])
        return new Set(placeholders).size === placeholders.length
      },
    ),
    noUnmatchedBraces: helpers.withMessage(
      'Invalid placeholder format - check your curly braces',
      (value) => {
        if (!value) return true
        const stripped = value.replace(/\{[A-Z_]+\}/g, '')
        return !stripped.includes('{') && !stripped.includes('}')
      },
    ),
  },
  departmentId: {
    required: helpers.withMessage('Department is required', required),
  },
  siteId: {
    required: helpers.withMessage('Site is required', required),
  },
  periodicReviewMonths: {
    required: helpers.withMessage('Periodic review period is required', required),
    minValue: helpers.withMessage('Must be at least 1 month', minValue(1)),
  },
}))

// Setup validator
const validator = useValidator(rules, form)

async function saveDraft() {
  // Validate form fields using Vuelidate
  const isValid = await validator.value.$validate()

  if (!isValid) {
    $q.notify({
      type: 'warning',
      message: 'Please fix the validation errors before saving',
    })
    // Switch to properties tab if validation fails
    activeTab.value = 'properties'
    return
  }

  saving.value = true
  try {
    const result = await createDocument(form.value) // Pass true to indicate it's a draft save

    if (result.error) {
      $q.notify({ type: 'negative', message: result.error })
      return true // Indicate error
    } else {
      $q.notify({ type: 'positive', message: 'Document saved as draft' })
      form.value = { ...DEFAULT_FORM } // Clear form after successful creation
      router.push(getCompanyPath(`/documents/${result.document.id}`))
    }
  } finally {
    saving.value = false
  }
}

async function continueToNext() {
  const isValid = await validator.value.$validate()
  if (!isValid) {
    $q.notify({
      type: 'warning',
      message: 'Please fix the validation errors before continuing',
    })
    activeTab.value = 'properties'
    return
  } else {
    goToNextTab()
  }
}

function goToNextTab() {
  if (activeTab.value === 'properties') {
    activeTab.value = 'changeControl'
  } else if (activeTab.value === 'changeControl') {
    activeTab.value = 'content'
  } else if (activeTab.value === 'content') {
    activeTab.value = 'training'
  }
}

function cancel() {
  form.value = { ...DEFAULT_FORM } // Clear form on cancel
  router.push(getCompanyPath('/documents'))
}
</script>

<template>
  <div class="tw:relative tw:flex tw:flex-col tw:h-full">
    <SafeTeleport to="#main-header-title">
      <div class="tw:flex tw:items-center tw:gap-2 tw:text-on-sidebar">
        <WIcon icon="description" class="tw:text-primary" size="24px" />
        <h2 class="tw:text-lg tw:font-bold tw:tracking-tight tw:text-nowrap">Create Document</h2>
      </div>
    </SafeTeleport>

    <!-- Scrollable content -->
    <div class="tw:flex-1 tw:overflow-y-auto tw:pb-24">
      <div class="tw:max-w-4xl tw:mx-auto tw:px-6 tw:py-8">
        <!-- Header -->
        <div class="tw:mb-8">
          <h1 class="tw:text-3xl tw:font-extrabold tw:text-on-sidebar tw:mb-6">
            Create New Document
          </h1>

          <!-- Tabs Navigation -->
          <div class="tw:flex tw:border-b tw:border-divider">
            <button
              :class="[
                'tw:px-6 tw:py-3 tw:border-b-2 tw:font-semibold tw:text-sm tw:flex tw:items-center tw:gap-2 tw:transition-colors',
                activeTab === 'properties'
                  ? 'tw:border-primary tw:text-primary'
                  : 'tw:border-transparent tw:text-secondary tw:hover:text-on-sidebar',
              ]"
              @click="activeTab = 'properties'"
            >
              <WIcon name="info" size="18px" /> Properties
            </button>
            <button
              :class="[
                'tw:px-6 tw:py-3 tw:border-b-2 tw:font-semibold tw:text-sm tw:flex tw:items-center tw:gap-2 tw:transition-colors',
                activeTab === 'changeControl'
                  ? 'tw:border-primary tw:text-primary'
                  : 'tw:border-transparent tw:text-secondary tw:hover:text-on-sidebar',
              ]"
              @click="activeTab = 'changeControl'"
            >
              <WIcon name="history_edu" size="18px" /> Change Control
            </button>
            <button
              :class="[
                'tw:px-6 tw:py-3 tw:border-b-2 tw:font-semibold tw:text-sm tw:flex tw:items-center tw:gap-2 tw:transition-colors',
                activeTab === 'content'
                  ? 'tw:border-primary tw:text-primary'
                  : 'tw:border-transparent tw:text-secondary tw:hover:text-on-sidebar',
              ]"
              @click="activeTab = 'content'"
            >
              <WIcon name="article" size="18px" /> Content
            </button>
            <button
              :class="[
                'tw:px-6 tw:py-3 tw:border-b-2 tw:font-semibold tw:text-sm tw:flex tw:items-center tw:gap-2 tw:transition-colors',
                activeTab === 'training'
                  ? 'tw:border-primary tw:text-primary'
                  : 'tw:border-transparent tw:text-secondary tw:hover:text-on-sidebar',
              ]"
              @click="activeTab = 'training'"
            >
              <WIcon name="school" size="18px" /> Training Assessment
            </button>
          </div>
        </div>

        <!-- Tab Content -->
        <div class="tw:space-y-6">
          <!-- Properties Tab -->
          <DocumentsCreateProperties
            v-show="activeTab === 'properties'"
            v-model="form"
            v-model:selectedTemplate="selectedTemplate"
          />

          <!-- Change Control Tab -->
          <DocumentsCreateChangeControl v-show="activeTab === 'changeControl'" />

          <!-- Content Tab -->
          <DocumentsCreateContent
            v-show="activeTab === 'content'"
            :form="form"
            :selectedTemplate="selectedTemplate"
          />

          <!-- Training Assessment Tab -->
          <DocumentsCreateTraining v-show="activeTab === 'training'" />
        </div>
      </div>
    </div>

    <!-- Sticky Footer Action Bar -->
    <div
      class="tw:absolute tw:bottom-0 tw:left-0 tw:right-0 tw:bg-sidebar/80 tw:backdrop-blur-md tw:border-t tw:border-divider tw:px-6 tw:py-4 tw:z-50"
    >
      <div class="tw:max-w-4xl tw:mx-auto tw:flex tw:items-center tw:justify-between">
        <div class="tw:flex tw:items-center tw:gap-4 tw:text-secondary tw:text-sm"></div>
        <div class="tw:flex tw:items-center tw:gap-4">
          <WBtn
            flat
            label="Cancel"
            color="negative"
            class="tw:font-bold"
            :loading="saving"
            @click="cancel"
          />
          <WBtn
            flat
            label="Save Draft"
            color="secondary"
            class="tw:font-bold"
            :loading="saving"
            @click="saveDraft"
          />
          <WBtn
            v-if="activeTab !== 'training'"
            unelevated
            label="Continue"
            iconRight="arrow_forward"
            color="primary"
            class="tw:font-bold tw:shadow-lg"
            :loading="saving"
            @click="continueToNext"
          />
        </div>
      </div>
    </div>
  </div>
</template>

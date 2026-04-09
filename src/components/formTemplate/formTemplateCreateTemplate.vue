<script setup>
import { IconArrowBack, IconArrowForward, IconCirclePlus, IconFileDescription, IconCircleCheck, IconX } from '@tabler/icons-vue'
import { required, helpers } from '@vuelidate/validators'
import { useValidator } from '@shared/composables/validator.js'
import { useTemplateForm } from '@/composables/useTemplateForm'
import { useSites } from '@/composables/useSites'
import { QMS_TEMPLATES } from '@/constants/formTemplates'

const emit = defineEmits(['next', 'cancel'])

const open = defineModel({
  type: Boolean,
  default: false,
})

const {
  templateForm,
  loadingDocumentTypes,
  createTemplate,
  resetForm: resetTemplateForm,
} = useTemplateForm()

const templateRules = computed(() => ({
  title: { required: helpers.withMessage('Required', required) },
  documentTypeId: { required: helpers.withMessage('Required', required) },
  code: { required: helpers.withMessage('Required', required) },
}))

const templateValidator = useValidator(templateRules, templateForm)

// sites is now a live query - no need to fetch
const { sites } = useSites()

const step = ref(1)
const selectedPreset = ref(null)

function applyTemplate(preset) {
  selectedPreset.value = preset.title
  templateForm.schema = JSON.parse(JSON.stringify(preset.schema))
}

function selectBlank() {
  selectedPreset.value = 'blank'
  templateForm.schema = []
}

function closeWizard() {
  resetForm()
  open.value = false
  emit('cancel')
}

async function goToFormBuilder() {
  const valid = await templateValidator.value.$validate()
  if (!valid) return

  const result = await createTemplate()
  if (!result.error) {
    emit('next', result.template)
    open.value = false
  } else {
    console.error('Failed to create template:', result.error)
  }
}

function resetForm() {
  resetTemplateForm()
  step.value = 1
  selectedPreset.value = null
}

function nextStep() {
  if (step.value === 1 && templateForm.isValid) {
    step.value = 2
  }
}

function prevStep() {
  if (step.value === 2) {
    step.value = 1
  }
}
</script>

<template>
  <BaseDialog v-model="open" minWidth="540px" maxWidth="800px" :close="false" persistent>
    <!-- Wizard Header -->
    <template #title>
      <div class="tw:flex tw:justify-between tw:items-center tw:w-full">
        <div>
          <div class="tw:text-xl tw:font-bold tw:text-on-main">Create New Template</div>
          <div class="tw:text-xs tw:text-secondary">
            Step {{ step }}: {{ step === 1 ? 'Define Metadata' : 'Choose Template' }}
          </div>
        </div>
        <BaseButton icon="sym_o_close" flat round dense color="grey-6" @click="closeWizard" />
      </div>
    </template>

    <!-- Wizard Body -->
    <div class="tw:flex tw:flex-col tw:gap-4">
      <!-- Step 1: Metadata -->
      <div v-if="step === 1" class="tw:flex tw:flex-col tw:gap-4">
        <!-- Template Name -->
        <BaseTextInput
          v-model="templateForm.title"
          name="title"
          label="Template Name"
          placeholder="e.g. Internal Quality Audit Checklist"
        >
          <template #label> Template Name <span class="tw:text-bad">*</span> </template>
        </BaseTextInput>

        <!-- Document Type & ID Prefix Row -->
        <div class="tw:grid tw:grid-cols-2 tw:gap-4">
          <DocumentTypeSelectMenu
            v-model="templateForm.documentTypeId"
            name="documentTypeId"
            label="Document Type"
            placeholder="Select Type..."
            :loading="loadingDocumentTypes"
            required
          >
            <template #label> Document Type <span class="tw:text-bad">*</span> </template>
          </DocumentTypeSelectMenu>

          <BaseTextInput
            v-model="templateForm.code"
            name="code"
            label="Code"
            placeholder="e.g. QUA, AUD"
            hint="Used for Record ID generation."
            :loading="templateForm.isChecking"
          >
            <template #label> Code <span class="tw:text-bad">*</span> </template>
            <template #append>
              <IconCircleCheck
                v-if="templateForm.isAvailable === true"
                class="tw:text-positive tw:w-4 tw:h-4"
              />
              <IconX
                v-else-if="templateForm.isAvailable === false"
                class="tw:text-negative tw:w-4 tw:h-4"
              />
            </template>
          </BaseTextInput>
        </div>

        <!-- Training Configuration -->
        <div class="tw:bg-main-hover tw:p-3 tw:rounded-lg">
          <div class="ds-label-sm tw:text-secondary tw:mb-3">Training Configuration</div>
          <div class="tw:flex tw:flex-col tw:gap-3">
            <div class="tw:flex tw:justify-between tw:items-center">
              <span class="tw:text-sm tw:text-on-main">Training Required?</span>
              <BaseSwitch v-model="templateForm.trainingRequired" color="primary" />
            </div>
            <div class="tw:text-xs tw:text-secondary tw:mt-[-8px]">
              If enabled, users must link a training course when creating a record.
            </div>

            <div class="tw:flex tw:justify-between tw:items-center">
              <span class="tw:text-sm tw:text-on-main">Retraining Required on Revision?</span>
              <BaseSwitch v-model="templateForm.retrainingOnRevision" color="primary" />
            </div>
          </div>
        </div>

        <!-- Site Availability -->
        <div class="tw:bg-main-hover tw:p-3 tw:rounded-lg tw:overflow-auto tw:max-h-[200px]">
          <div class="ds-label-sm tw:text-secondary tw:mb-3">Site Availability</div>
          <div v-if="sites.length > 0" class="tw:grid tw:grid-cols-2 tw:gap-2">
            <div v-for="site in sites" :key="site.id">
              <BaseCheckbox
                v-model="templateForm.selectedSites"
                :val="site.id"
                :label="site.name"
                color="primary"
              />
            </div>
          </div>
          <div v-else class="tw:text-xs tw:text-secondary">No sites available.</div>
        </div>
      </div>

      <!-- Step 2: Template Selection with Previews -->
      <div v-else-if="step === 2" class="tw:flex tw:flex-col">
        <div class="tw:text-sm tw:text-secondary tw:mb-4">
          Select a starting point for your form schema. You can further customize this in the next
          step.
        </div>

        <div class="tw:grid tw:grid-cols-2 tw:gap-4 tw:overflow-auto tw:max-h-[500px] tw:p-1">
          <!-- Blank Option -->
          <div
            class="tw:flex tw:flex-col tw:items-center tw:justify-center tw:p-8 tw:border tw:border-divider tw:rounded-xl tw:cursor-pointer tw:transition-all tw:duration-200 tw:bg-main tw:hover:bg-main-hover tw:hover:border-primary"
            :class="{ 'tw:border-primary tw:bg-main-hover': selectedPreset === 'blank' }"
            @click="selectBlank"
          >
            <IconCirclePlus class="tw:text-placeholder tw:w-12 tw:h-12" />
            <div class="tw:text-lg tw:font-bold tw:mt-4 tw:text-on-main">Blank Form</div>
            <div class="tw:text-xs tw:text-secondary tw:text-center">Start from a clean slate</div>
          </div>

          <!-- Presets -->
          <div
            v-for="preset in QMS_TEMPLATES"
            :key="preset.code"
            class="tw:flex tw:flex-col tw:p-4 tw:border tw:border-divider tw:rounded-xl tw:cursor-pointer tw:transition-all tw:duration-200 tw:bg-main tw:hover:bg-main-hover tw:hover:border-primary"
            :class="{ 'tw:border-primary tw:bg-main-hover': selectedPreset === preset.title }"
            @click="applyTemplate(preset)"
          >
            <div class="tw:flex tw:items-center tw:justify-between tw:mb-3">
              <span class="tw:text-sm tw:font-bold tw:text-primary">{{ preset.title }}</span>
              <IconFileDescription class="tw:text-primary tw:w-4 tw:h-4" />
            </div>
            <!-- Mini Preview Area -->
            <div
              class="tw:h-[180px] tw:overflow-hidden tw:relative tw:bg-main tw:border tw:border-divider tw:rounded-lg"
            >
              <div
                class="tw:w-[200%] tw:scale-[0.5] tw:origin-top-left tw:p-4 tw:pointer-events-none"
              >
                <DynamicForm :fields="preset.schema" readonly :modelValue="{}" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Actions -->
    <template #actions>
      <div class="tw:flex tw:justify-between tw:items-center tw:w-full tw:px-6 tw:pb-6">
        <BaseButton
          v-if="step === 2"
          label="Back"
          :icon="IconArrowBack"
          flat
          color="grey-7"
          @click="prevStep"
        />
        <div v-else />

        <div class="tw:flex tw:gap-3">
          <BaseButton
            label="Cancel"
            outline
            color="grey-7"
            :disable="templateForm.isSubmitting"
            @click="closeWizard"
          />
          <BaseButton
            v-if="step === 1"
            label="Next: Select Template"
            :iconRight="IconArrowForward"
            color="primary"
            unelevated
            :disable="!templateForm.isValid"
            @click="nextStep"
          />
          <BaseButton
            v-else
            label="Design Form"
            :iconRight="IconFileDescription"
            color="primary"
            unelevated
            :loading="templateForm.isSubmitting"
            :disable="selectedPreset === null"
            @click="goToFormBuilder"
          />
        </div>
      </div>
    </template>
  </BaseDialog>
</template>

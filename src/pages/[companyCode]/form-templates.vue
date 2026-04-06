<script setup>
import DynamicForm from '@/components/form/DynamicForm.js'

defineOptions({
  name: 'FormTemplates',
})

const isSubmitting = ref(false)
const showCreateForm = ref(false)
const isReadonly = ref(false)
const formData = ref({})

// Supported field types
const supportedFieldTypes = [
  'input',
  'textarea',
  'password',
  'number',
  'select',
  'checkbox',
  'radio',
  'optionGroup',
  'checklist',
  'datetime',
  'textEditor',
  'colorPicker',
  'slider',
  'toggle',
  'file',
  'photo',
  'rating',
  'section',
  'repeater',
  'row',
  'column',
  'separator',
]

// Sample form fields demonstrating all field types
const sampleFormFields = ref([
  // Basic Information Section (Collapsible)
  {
    type: 'section',
    name: 'basicInfoSection',
    label: 'Basic Information',
    collapsible: true,
    collapsed: false,
    children: [
      {
        type: 'row',
        class: 'col-12',
        children: [
          {
            type: 'input',
            name: 'firstName',
            label: 'First Name',
            placeholder: 'Enter first name',
            class: 'col-6',
          },
          {
            type: 'input',
            name: 'lastName',
            label: 'Last Name',
            placeholder: 'Enter last name',
            class: 'col-6',
          },
        ],
      },
      {
        type: 'input',
        name: 'email',
        label: 'Email Address',
        placeholder: 'example@company.com',
        hint: 'We will send confirmation here',
        props: { type: 'email' },
      },
      {
        type: 'password',
        name: 'password',
        label: 'Password',
        placeholder: 'Enter password',
        hint: 'Minimum 8 characters',
      },
      {
        type: 'photo',
        name: 'profilePhoto',
        label: 'Profile Photo',
        placeholder: 'Upload or take a photo',
        mode: 'both',
        previewSize: '150px',
        maxFileSize: 5242880,
        facingMode: 'user',
      },
    ],
  },

  // Employment Details Section
  {
    type: 'section',
    name: 'employmentSection',
    label: 'Employment Details',
    collapsible: true,
    children: [
      {
        type: 'select',
        name: 'department',
        label: 'Department',
        placeholder: 'Select department',
        options: [
          { label: 'Engineering', value: 'engineering' },
          { label: 'Marketing', value: 'marketing' },
          { label: 'Sales', value: 'sales' },
          { label: 'HR', value: 'hr' },
          { label: 'Quality', value: 'quality' },
          { label: 'Other', value: 'other' },
        ],
      },
      // Conditional field - only shows when department is 'other'
      {
        type: 'input',
        name: 'otherDepartment',
        label: 'Specify Department',
        placeholder: 'Enter department name',
        condition: (formData) => formData.department === 'other',
      },
      {
        type: 'radio',
        name: 'employmentType',
        label: 'Employment Type',
        options: [
          { label: 'Full-time', value: 'full-time' },
          { label: 'Part-time', value: 'part-time' },
          { label: 'Contract', value: 'contract' },
        ],
      },
      {
        type: 'row',
        class: 'col-12',
        children: [
          {
            type: 'datetime',
            name: 'startDate',
            label: 'Start Date',
            class: 'col-6',
          },
          {
            type: 'number',
            name: 'salary',
            label: 'Expected Salary',
            placeholder: '0',
            min: 0,
            step: 1000,
            class: 'col-6',
          },
        ],
      },
    ],
  },

  // Skills & Experience Section
  {
    type: 'section',
    name: 'skillsSection',
    label: 'Skills & Experience',
    collapsible: true,
    children: [
      {
        type: 'optionGroup',
        name: 'skills',
        label: 'Technical Skills',
        options: [
          { label: 'JavaScript', value: 'javascript' },
          { label: 'Python', value: 'python' },
          { label: 'Vue.js', value: 'vuejs' },
          { label: 'Node.js', value: 'nodejs' },
          { label: 'SQL', value: 'sql' },
        ],
      },
      {
        type: 'slider',
        name: 'experienceYears',
        label: 'Years of Experience',
        min: 0,
        max: 20,
        step: 1,
        labelAlways: true,
        markers: true,
      },
      {
        type: 'rating',
        name: 'selfRating',
        label: 'Self Assessment Rating',
        max: 5,
        size: 'lg',
        color: 'amber',
      },
      {
        type: 'checklist',
        name: 'skillsAssessment',
        label: 'Skills Self-Assessment',
        hint: 'Rate your proficiency level for each skill',
        rows: [
          { value: 'communication', label: 'Communication' },
          { value: 'teamwork', label: 'Teamwork' },
          { value: 'problemSolving', label: 'Problem Solving' },
          { value: 'leadership', label: 'Leadership' },
        ],
        columns: [
          { value: 'beginner', label: 'Beginner', inputType: 'radio' },
          { value: 'intermediate', label: 'Intermediate', inputType: 'checkbox' },
          { value: 'advanced', label: 'Advanced', inputType: 'text' },
          { value: 'expert', label: 'Expert', inputType: 'number' },
        ],
      },
    ],
  },

  // Contact Information - Repeatable
  {
    type: 'repeater',
    name: 'phoneNumbers',
    label: 'Phone Numbers',
    itemLabel: 'Phone',
    minItems: 1,
    maxItems: 3,
    addLabel: 'Add Phone Number',
    template: [
      {
        type: 'row',
        children: [
          {
            hint: '',
            name: 'email_1',
            type: 'input',
            class: 'col-3',
            label: 'Email Address',
            style: '',
            disabled: false,
            readonly: false,
            required: true,
            placeholder: 'example@mail.com',
          },
          {
            hint: '',
            name: 'phone_1',
            type: 'input',
            class: 'col-3',
            label: 'Phone Number',
            style: '',
            disabled: false,
            readonly: false,
            required: true,
            placeholder: '+1 234 567 8900',
          },
          {
            hint: '',
            name: 'address_1',
            type: 'input',
            class: 'col-3',
            label: 'Street Address',
            style: '',
            disabled: false,
            readonly: false,
            required: true,
            placeholder: '123 Main Street',
          },
          {
            hint: '',
            name: 'city_1',
            type: 'input',
            class: 'col-3',
            label: 'City',
            style: '',
            disabled: false,
            readonly: false,
            required: true,
            placeholder: 'New York',
          },
        ],
      },
    ],
  },

  { type: 'separator', props: { class: 'q-my-md' } },

  // Additional Options
  {
    type: 'row',
    class: 'col-12',
    children: [
      {
        type: 'toggle',
        name: 'isRemote',
        label: 'Remote Work Preferred',
        class: 'col-6',
      },
      {
        type: 'toggle',
        name: 'newsletter',
        label: 'Subscribe to Newsletter',
        class: 'col-6',
      },
    ],
  },

  // Resume Upload
  {
    type: 'file',
    name: 'resume',
    label: 'Upload Resume',
    accept: '.pdf,.doc,.docx',
    hint: 'PDF, DOC, or DOCX (max 5MB)',
    maxFileSize: 5242880,
  },

  // Bio with Text Editor
  {
    type: 'textarea',
    name: 'bio',
    label: 'About Yourself',
    placeholder: 'Write a brief bio...',
    hint: 'Tell us about your background and interests',
  },

  // Agreement
  {
    type: 'checkbox',
    name: 'agreeToTerms',
    props: { label: 'I agree to the Terms of Service and Privacy Policy' },
  },
])

// Available form templates
const formTemplates = ref([
  {
    id: 1,
    name: 'Employee Registration',
    description: 'Standard employee onboarding form',
    icon: 'person_add',
  },
  {
    id: 2,
    name: 'Audit Checklist',
    description: 'Quality audit assessment form',
    icon: 'fact_check',
  },
  {
    id: 3,
    name: 'Incident Report',
    description: 'Safety and incident reporting',
    icon: 'report_problem',
  },
  {
    id: 4,
    name: 'Training Feedback',
    description: 'Post-training evaluation form',
    icon: 'school',
  },
  {
    id: 5,
    name: 'Supplier Assessment',
    description: 'Vendor quality evaluation',
    icon: 'business',
  },
])

function resetForm() {
  formData.value = {}
}

function selectTemplate(template) {
  console.info('Selected template:', template)
  // Load template fields here
}

function handleSubmit(data, done) {
  console.info('Form submitted:', data)

  // Simulate API call
  setTimeout(() => {
    done()
    console.info('Form submission complete')
  }, 2000)
}
</script>

<template>
  <div class="tw:p-5 tw:bg-main tw:min-h-screen">
    <!-- Page Header -->
    <div class="tw:flex tw:items-center tw:justify-between tw:mb-12">
      <div>
        <div class="tw:text-3xl tw:font-bold tw:text-on-main">Form Templates</div>
        <div class="tw:text-sm tw:text-secondary">
          Create and manage dynamic form templates for your organization.
        </div>
      </div>
      <div class="tw:flex tw:items-center tw:gap-3">
        <QToggle v-model="isReadonly" label="Read-only Mode" color="primary" />
        <WBtn outline color="grey-7" icon="download" label="Export" noCaps />
        <WBtn
          color="primary"
          icon="add"
          label="New Template"
          unelevated
          @click="showCreateForm = true"
        />
      </div>
    </div>

    <div class="tw:grid tw:grid-cols-12 tw:gap-8">
      <!-- Form Preview Section -->
      <div class="tw:col-span-12 tw:lg:col-span-8">
        <WCard flat bordered class="tw:rounded-xl">
          <QCardSection class="tw:flex tw:items-center tw:pb-0">
            <div class="tw:text-lg tw:font-medium">Form Preview</div>
            <QSpace />
            <WBtn flat color="primary" label="Reset" dense @click="resetForm" />
          </QCardSection>
          <QCardSection>
            <DynamicForm
              v-model="formData"
              :fields="sampleFormFields"
              :loading="isSubmitting"
              :readonly="isReadonly"
              @submit="handleSubmit"
            >
              <template #header>
                <div class="tw:text-base tw:font-medium tw:mb-6">Employee Registration Form</div>
              </template>
              <template #footer>
                <div class="tw:flex tw:justify-end tw:mt-8 tw:gap-3">
                  <WBtn outline color="grey-7" label="Cancel" @click="resetForm" />
                  <WBtn
                    type="submit"
                    color="primary"
                    label="Submit"
                    unelevated
                    :loading="isSubmitting"
                    :disable="isReadonly"
                  />
                </div>
              </template>
            </DynamicForm>
          </QCardSection>
        </WCard>

        <!-- Form Data Preview -->
        <WCard flat bordered class="tw:rounded-xl tw:mt-8">
          <QCardSection class="tw:flex tw:items-center tw:pb-0">
            <div class="tw:text-lg tw:font-medium">Form Data (v-model)</div>
            <QSpace />
            <QChip color="info" textColor="white" size="sm">Live Preview</QChip>
          </QCardSection>
          <QCardSection>
            <pre
              class="tw:bg-[#1e293b] tw:text-[#4ade80] tw:p-4 tw:rounded-lg tw:font-mono tw:text-xs tw:overflow-x-auto tw:max-h-100 tw:m-0"
            >
              {{ JSON.stringify(formData, null, 2) }}
            </pre>
          </QCardSection>
        </WCard>
      </div>

      <!-- Form Templates List -->
      <div class="tw:col-span-12 tw:lg:col-span-4">
        <WCard flat bordered class="tw:rounded-xl">
          <QCardSection>
            <div class="tw:text-lg tw:font-medium tw:mb-6">Available Templates</div>
            <QList separator>
              <QItem
                v-for="template in formTemplates"
                :key="template.id"
                class="tw:rounded-lg tw:transition-colors tw:duration-200 tw:hover:bg-main-hover tw:p-4"
                clickable
                @click="selectTemplate(template)"
              >
                <QItemSection avatar>
                  <WAvatar color="primary" textColor="white" size="40px">
                    <WIcon :icon="template.icon" size="20px" />
                  </WAvatar>
                </QItemSection>
                <QItemSection>
                  <QItemLabel class="tw:font-medium">{{ template.name }}</QItemLabel>
                  <QItemLabel caption>{{ template.description }}</QItemLabel>
                </QItemSection>
                <QItemSection side>
                  <WIcon icon="chevron_right" color="grey-5" />
                </QItemSection>
              </QItem>
            </QList>
          </QCardSection>
        </WCard>

        <!-- Quick Info -->
        <WCard flat bordered class="tw:rounded-xl tw:mt-8">
          <QCardSection>
            <div class="tw:text-lg tw:font-medium tw:mb-6">Supported Field Types</div>
            <div class="tw:flex tw:flex-wrap tw:gap-2">
              <QChip
                v-for="fieldType in supportedFieldTypes"
                :key="fieldType"
                color="grey-3"
                textColor="grey-8"
                size="sm"
              >
                {{ fieldType }}
              </QChip>
            </div>
          </QCardSection>
        </WCard>

        <!-- New Features -->
        <WCard flat bordered class="tw:rounded-xl tw:mt-8">
          <QCardSection>
            <div class="tw:text-lg tw:font-medium tw:mb-6">New Features</div>
            <QList dense>
              <QItem>
                <QItemSection avatar>
                  <WIcon icon="visibility" color="primary" />
                </QItemSection>
                <QItemSection>Conditional Fields</QItemSection>
              </QItem>
              <QItem>
                <QItemSection avatar>
                  <WIcon icon="folder" color="primary" />
                </QItemSection>
                <QItemSection>Collapsible Sections</QItemSection>
              </QItem>
              <QItem>
                <QItemSection avatar>
                  <WIcon icon="repeat" color="primary" />
                </QItemSection>
                <QItemSection>Repeatable Fields</QItemSection>
              </QItem>
              <QItem>
                <QItemSection avatar>
                  <WIcon icon="lock" color="primary" />
                </QItemSection>
                <QItemSection>Read-only Mode</QItemSection>
              </QItem>
            </QList>
          </QCardSection>
        </WCard>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
:deep(.repeater-item) {
  border: 1px solid var(--q-grey-3); // Keeping this for now as it affects DynamicForm internals
  border-radius: 8px;
}

:deep(.section-field) {
  border: 1px solid var(--q-grey-3);
  border-radius: 8px;
  overflow: hidden;
}
</style>

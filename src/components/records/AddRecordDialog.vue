<script setup>
import { currentCompany } from '@/utils/currentCompany.js'
import DynamicForm from '@/components/form/DynamicForm.js'
import { useQuasar } from 'quasar'
import { get } from '@/api'

const props = defineProps({
  createRecord: {
    type: Function,
    required: true,
  },
})

const emit = defineEmits(['created', 'close'])
const $q = useQuasar()

// Dialog state
const step = ref('select') // 'select' | 'form' | 'success'

// Template selection
const templates = ref([])
const templatesLoading = ref(false)
const templateSearch = ref('')
const selectedTemplate = ref(null)
const schemaLoading = ref(false)

// Form state
const formData = ref({})
const submitting = ref(false)
const createdRecord = ref(null)

const filteredTemplates = computed(() => {
  if (!templateSearch.value) return templates.value
  const search = templateSearch.value.toLowerCase()
  return templates.value.filter(
    (t) => t.title.toLowerCase().includes(search) || t.code.toLowerCase().includes(search),
  )
})

async function fetchTemplates() {
  const companyId = currentCompany.value?.id
  if (!companyId) return

  const data = await get('/v1/services/formTemplates', {
    params: { companyId, stateId: 'ACTIVE' },
    loader: templatesLoading,
  })
  templates.value = data.formTemplates || []
}

async function selectTemplate(template) {
  selectedTemplate.value = template

  const data = await get(`/v1/services/formTemplates/${template.id}`, {
    params: { companyId: currentCompany.value.id },
    loader: schemaLoading,
  })
  selectedTemplate.value = data.formTemplate
  formData.value = {}
  step.value = 'form'
}

async function handleSubmit(data) {
  submitting.value = true
  const result = await props.createRecord(selectedTemplate.value.id, data)

  if (result.error) {
    $q.notify({ type: 'negative', message: result.error })
  } else {
    createdRecord.value = result.record
    step.value = 'success'
    emit('created', result.record)
  }
  submitting.value = false
}

function goBackToSelect() {
  step.value = 'select'
  selectedTemplate.value = null
  formData.value = {}
}

function handleClose() {
  emit('close')
}

const templateSchema = computed(() => {
  if (!selectedTemplate.value?.schema) return []
  return Array.isArray(selectedTemplate.value.schema) ? selectedTemplate.value.schema : []
})

onMounted(() => {
  fetchTemplates()
})
</script>

<template>
  <QCard class="tw:flex tw:flex-col tw:h-full tw:flex-nowrap">
    <!-- Header -->
    <QCardSection class="tw:flex tw:items-center tw:border-b tw:border-divider tw:py-3">
      <div class="tw:flex tw:items-center tw:gap-2">
        <WBtn v-if="step === 'form'" flat round dense icon="arrow_back" @click="goBackToSelect" />
        <div class="tw:text-lg tw:font-medium tw:text-on-main">
          <template v-if="step === 'select'">Select a Template</template>
          <template v-else-if="step === 'form'">{{ selectedTemplate?.title }}</template>
          <template v-else>Record Created</template>
        </div>
      </div>
      <QSpace />
      <WBtn flat round dense icon="close" @click="handleClose" />
    </QCardSection>

    <!-- Step 1: Template Selection -->
    <QCardSection v-if="step === 'select'" class="tw:flex-1 tw:overflow-auto tw:bg-sidebar">
      <div class="tw:max-w-175 tw:mx-auto tw:flex tw:flex-col tw:gap-4">
        <!-- Search -->
        <WInput
          v-model="templateSearch"
          placeholder="Search templates..."
          dense
          clearable
          hideBottomSpace
        >
          <template #prepend>
            <WIcon name="search" color="grey-6" />
          </template>
        </WInput>

        <!-- Loading -->
        <div v-if="templatesLoading" class="tw:flex tw:justify-center tw:py-12">
          <QSpinner color="primary" size="48px" />
        </div>

        <!-- Empty -->
        <WEmptyState
          v-else-if="filteredTemplates.length === 0"
          icon="description"
          title="No templates found"
          compact
        />

        <!-- Template List -->
        <div v-else class="tw:flex tw:flex-col tw:gap-2">
          <div
            v-for="template in filteredTemplates"
            :key="template.id"
            class="tw:cursor-pointer tw:bg-sidebar tw:border tw:border-divider tw:rounded-lg tw:p-3 tw:transition-all tw:hover:shadow-md tw:hover:border-primary/30"
            @click="selectTemplate(template)"
          >
            <div class="tw:flex tw:items-center tw:gap-3">
              <div class="tw:flex tw:flex-col tw:gap-0.5">
                <div class="tw:font-bold tw:text-on-sidebar">{{ template.title }}</div>
                <div class="tw:text-xs tw:text-secondary tw:font-mono tw:uppercase">
                  {{ template.code }}
                </div>
              </div>
              <QSpace />
              <WIcon icon="chevron_right" size="24px" class="tw:text-secondary" />
            </div>
          </div>
        </div>
      </div>

      <!-- Schema loading overlay -->
      <QInnerLoading :showing="schemaLoading">
        <QSpinner color="primary" size="48px" />
      </QInnerLoading>
    </QCardSection>

    <!-- Step 2: Form -->
    <QCardSection
      v-else-if="step === 'form'"
      class="tw:flex-1 tw:p-0 tw:overflow-auto tw:bg-sidebar"
    >
      <div class="tw:p-5 tw:min-h-full">
        <QCard flat bordered class="tw:mx-auto" style="max-width: 800px">
          <QCardSection>
            <DynamicForm
              v-model="formData"
              :fields="templateSchema"
              :loading="submitting"
              @submit="handleSubmit"
            >
              <template #footer>
                <div class="tw:flex tw:justify-end tw:gap-2 tw:mt-4">
                  <WBtn flat label="Back" @click="goBackToSelect" />
                  <WBtn
                    type="submit"
                    color="primary"
                    label="Save Record"
                    :loading="submitting"
                    unelevated
                  />
                </div>
              </template>
            </DynamicForm>
          </QCardSection>
        </QCard>
      </div>
    </QCardSection>

    <!-- Step 3: Success -->
    <QCardSection v-else class="tw:flex-1 tw:flex tw:flex-col tw:items-center tw:justify-center">
      <WIcon icon="check_circle" class="tw:text-good" size="64px" />
      <div class="tw:text-2xl tw:font-bold tw:mt-4 tw:text-good">Record Created!</div>
      <p class="tw:text-secondary tw:mt-2">
        Record number: <strong>{{ createdRecord?.recordNumber }}</strong>
      </p>
      <WBtn color="primary" label="Close" class="tw:mt-6" unelevated @click="handleClose" />
    </QCardSection>
  </QCard>
</template>

<script setup>
import { currentCompany } from '@/utils/currentCompany.js'
import { useQuasar } from 'quasar'
import { get } from '@/api'

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const $q = useQuasar()
const router = useRouter()

const { updateTemplate, loading: updating } = useFormTemplates()
const isEditingTitle = ref(false)
const editTitleValue = ref('')

const template = ref(null)
const loading = ref(false)
const error = ref(null)

async function fetchTemplate() {
  if (!props.id || !currentCompany.value?.id) return

  error.value = null

  const data = await get(`/v1/services/formTemplates/${props.id}`, {
    params: { companyId: currentCompany.value.id },
    loader: loading,
  })
  template.value = data.formTemplate
}

async function saveSchema(schemaData) {
  const success = await updateTemplate(props.id, { schema: schemaData })

  if (success) {
    $q.notify({
      type: 'positive',
      message: 'Form template saved successfully',
    })
    handleCancel()
  }
}

function handleCancel() {
  router.push({
    path: router.currentRoute.value.path,
    query: { ...router.currentRoute.value.query, mode: undefined },
  })
}

// Computed: get the schema from the template
const initialSchema = computed(() => {
  if (!template.value?.schema) return []
  // Handle both array and object schema formats
  return Array.isArray(template.value.schema) ? template.value.schema : []
})

// Computed: build the title for the form builder
const builderTitle = computed(() => {
  if (!template.value) return 'Schema Builder'
  return `Edit Schema: ${template.value.title}`
})

function startEditTitle() {
  if (!template.value) return
  editTitleValue.value = template.value.title
  isEditingTitle.value = true
}

async function saveTitle() {
  if (!isEditingTitle.value) return

  const success = await updateTemplate(props.id, {
    title: editTitleValue.value,
  })

  if (success) {
    template.value.title = editTitleValue.value
    cancelEditTitle()
  }
}

function cancelEditTitle() {
  isEditingTitle.value = false
  editTitleValue.value = ''
}

// Fetch when id or company changes
watch(
  [() => props.id, () => currentCompany.value?.id],
  () => {
    fetchTemplate()
  },
  { immediate: true },
)
</script>

<template>
  <div class="tw:relative tw:h-full">
    <!-- Loading State -->
    <div
      v-if="loading"
      class="tw:flex tw:flex-col tw:items-center tw:justify-center tw:h-full tw:p-5"
    >
      <QSpinner color="primary" size="48px" />
      <div class="tw:text-sm tw:text-secondary tw:mt-3">Loading template...</div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="tw:flex tw:flex-col tw:items-center tw:justify-center tw:h-full tw:p-5"
    >
      <WIcon icon="error_outline" size="48px" class="tw:text-negative" />
      <div class="tw:text-base tw:text-negative tw:mt-3">{{ error }}</div>
      <div class="tw:flex tw:gap-2 tw:mt-4">
        <WBtn label="Try Again" color="primary" outline @click="fetchTemplate" />
        <WBtn label="Go Back" color="grey-7" flat @click="handleCancel" />
      </div>
    </div>

    <!-- Form Builder -->
    <template v-else-if="template">
      <FormBuilder :title="builderTitle" :initialSchema="initialSchema" @save="saveSchema">
        <template #title>
          <div
            v-if="isEditingTitle"
            class="tw:flex tw:flex-nowrap tw:items-center tw:gap-2 tw:max-w-[400px]"
          >
            <WInput
              v-model="editTitleValue"
              autofocus
              dense
              class="tw:flex-1"
              @keyup.enter="saveTitle"
              @keyup.esc="cancelEditTitle"
              @blur="saveTitle"
            />
          </div>
          <div
            v-else
            class="tw:flex tw:items-center tw:gap-2 tw:cursor-pointer tw:hover:text-primary tw:transition-colors"
            @click="startEditTitle"
          >
            <span class="tw:text-secondary">Edit Schema:</span>
            <span class="tw:font-bold">{{ template.title }}</span>
            <WIcon icon="edit" size="14px" class="tw:text-secondary" />
          </div>
        </template>
      </FormBuilder>

      <!-- Saving Overlay -->
      <QInnerLoading :showing="updating">
        <QSpinner color="primary" size="48px" />
        <div class="tw:text-sm tw:text-secondary tw:mt-4">Saving...</div>
      </QInnerLoading>
    </template>

    <!-- Empty State -->
    <div v-else class="tw:flex tw:flex-col tw:items-center tw:justify-center tw:h-full tw:p-5">
      <WIcon icon="description" size="48px" class="tw:text-secondary/40" />
      <div class="tw:text-base tw:text-secondary tw:mt-4">No template selected</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
/* Minimal styles - most styling handled by Tailwind */
</style>

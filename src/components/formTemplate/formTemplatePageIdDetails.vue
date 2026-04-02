<script setup>
import { isAllowed } from '@/utils/currentSession'

import { getCompanyPath } from '@/utils/routeHelpers'
import { useQuasar } from 'quasar'

// Props
const props = defineProps({
  template: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: null,
  },
})

// Emits
const emit = defineEmits(['refresh', 'update', 'delete'])

// Composables
const $q = useQuasar()
const router = useRouter()
const { updateTemplate, deleteTemplate } = useFormTemplates()
const { statusOptions, fetchFormStatuses } = useTemplateForm()

// Refs
const formData = ref({}) // Using DynamicForm requires a v-model, even if read-only
const editingField = ref(null) // Inline editing state
const editValue = ref(null)

// Computed
const formattedCreatedAt = computed(() => {
  return props.template?.createdAt?.formatDate('date')
})

const relativeUpdatedAt = computed(() => {
  return props.template?.updatedAt?.formatDate('date')
})

const canUpdate = computed(() => isAllowed(['formTemplates:update']))
const canDelete = computed(() => isAllowed(['formTemplates:delete']))

// Functions
function startEdit(field) {
  if (!canUpdate.value) return

  editingField.value = field
  if (field === 'siteIds') {
    editValue.value = props.template.sites?.map((s) => s.id) || []
  } else {
    editValue.value = props.template[field]
  }
}

async function saveEdit() {
  if (!editingField.value && !canUpdate.value) return

  // Check if value actually changed
  if (editValue.value === props.template[editingField.value]) {
    cancelEdit()
    return
  }

  const data = {
    [editingField.value]: editValue.value,
  }

  const success = await updateTemplate(props.template.id, data)

  if (success) {
    emit('refresh')
    $q.notify({
      type: 'positive',
      message: 'Template updated successfully',
    })
    cancelEdit()
  } else {
    $q.notify({
      type: 'negative',
      message: 'Failed to update template',
    })
  }
}

function cancelEdit() {
  editingField.value = null
  editValue.value = null
}

async function handleDelete() {
  $q.dialog({
    title: 'Confirm Deletion',
    message: `Are you sure you want to delete form template "${props.template.title}" (${props.template.code})? This action cannot be undone.`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const success = await deleteTemplate(props.template.id)
    if (success) {
      $q.notify({
        type: 'positive',
        message: 'Form template deleted successfully',
      })
      router.push(getCompanyPath('/templates'))
    } else {
      $q.notify({
        type: 'negative',
        message: 'Failed to delete form template',
      })
    }
  })
}

// Lifecycle
onMounted(() => {
  fetchFormStatuses()
})
</script>

<template>
  <div class="tw:flex tw:overflow-hidden tw:h-full">
    <!-- Header Actions Section -->
    <SafeTeleport to="#main-header-actions">
      <div v-if="template" class="tw:flex tw:items-center tw:gap-3">
        <WBtn
          v-if="canDelete"
          icon="delete"
          label="Delete"
          color="null"
          outline
          class="tw:font-semibold tw:text-bad!"
          @click="handleDelete"
        />
        <WBtn
          v-if="canUpdate"
          icon="edit"
          label="Edit Template"
          outline
          class="tw:font-semibold"
          :to="getCompanyPath(`/templates/${template.id}?mode=schema`)"
        />
        <WBtn
          label="View records"
          outline
          class="tw:font-semibold"
          :to="getCompanyPath(`/templates/${template.id}?mode=records`)"
        />
      </div>
    </SafeTeleport>

    <!-- Main Content Area (Fields Preview) -->
    <div class="tw:grow tw:flex tw:flex-col tw:min-w-0 tw:overflow-hidden">
      <!-- Loading State -->
      <div v-if="loading" class="tw:flex tw:flex-col tw:items-center tw:justify-center tw:h-full">
        <QSpinner color="primary" size="48px" />
        <div class="tw:text-sm tw:text-on-main tw:mt-4">Loading template...</div>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="tw:flex tw:flex-col tw:items-center tw:justify-center tw:h-full"
      >
        <WIcon name="error_outline" size="48px" class="tw:text-bad" />
        <div class="tw:text-body1 tw:text-bad tw:mt-4">{{ error }}</div>
        <WBtn label="Try Again" color="primary" outline class="tw:mt-6" @click="emit('refresh')" />
      </div>

      <div v-else-if="template" class="tw:grow tw:flex tw:flex-col tw:p-8 tw:overflow-hidden">
        <div
          class="tw:max-w-3xl tw:mx-auto tw:flex tw:flex-col tw:w-full tw:h-full tw:overflow-hidden"
        >
          <div
            class="tw:mb-8 tw:flex tw:items-center tw:justify-between tw:border-b tw:border-divider tw:pb-4 tw:shrink-0"
          >
            <div>
              <h3 class="tw:text-lg tw:font-bold tw:text-on-main">Fields Preview</h3>
              <p class="tw:text-sm tw:text-secondary">
                Live representation of the form generated from metadata.
              </p>
            </div>
            <span class="ds-label-sm tw:text-secondary tw:bg-main-hover tw:px-2 tw:py-1 tw:rounded"
              >Read-only view</span
            >
          </div>

          <!-- Form area -->
          <div class="tw:grow tw:overflow-y-auto tw:min-h-0">
            <div
              class="tw:bg-sidebar tw:p-4 tw:rounded-xl tw:border tw:border-divider tw:shadow-sm"
            >
              <!-- Dynamic Form Preview -->
              <DynamicForm v-model="formData" :fields="template.schema || []" readonly />

              <div
                v-if="!template.schema || template.schema.length === 0"
                class="tw:text-center tw:py-8 tw:text-gray-500"
              >
                No fields defined in this template.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Sidebar (Metadata) -->
    <aside
      v-if="template"
      class="tw:w-96 tw:border-l tw:border-divider tw:bg-sidebar tw:overflow-y-auto tw:shrink-0"
    >
      <div class="tw:p-6">
        <div class="tw:flex tw:items-center tw:gap-2 tw:mb-6 tw:text-on-sidebar">
          <WIcon name="data_object" class="tw:text-primary" />
          <h3 class="tw:text-base tw:font-bold">Metadata Properties</h3>
        </div>
        <div class="tw:space-y-6">
          <!-- Template Identity -->
          <div class="tw:space-y-4">
            <h4 class="ds-label-sm tw:text-secondary">Template Identity</h4>
            <div class="tw:grid tw:gap-4">
              <div class="tw:space-y-1">
                <label class="tw:text-xs tw:font-medium tw:text-secondary">ID</label>
                <div
                  class="tw:text-sm tw:font-mono tw:bg-main tw:p-2 tw:rounded tw:text-on-main tw:break-all"
                >
                  {{ template.id }}
                </div>
              </div>
              <div class="tw:space-y-1">
                <label class="tw:text-xs tw:font-medium tw:text-secondary">Internal Title</label>
                <div v-if="editingField === 'title'">
                  <WInput
                    v-model="editValue"
                    noOutline
                    autofocus
                    @blur="saveEdit"
                    @keyup.enter="saveEdit"
                    @keyup.esc="cancelEdit"
                  />
                </div>
                <div
                  v-else
                  class="tw:mt-3 tw:text-sm tw:font-medium tw:text-on-main tw:border-b tw:border-divider tw:pb-1 tw:cursor-pointer tw:hover:bg-main-hover tw:px-2 tw:-mx-2 tw:rounded"
                  @click="startEdit('title')"
                >
                  {{ template.title }}
                </div>
              </div>
              <div class="tw:space-y-1">
                <label class="tw:text-xs tw:font-medium tw:text-secondary">Description</label>
                <div v-if="editingField === 'description'">
                  <WInput
                    v-model="editValue"
                    noOutline
                    autofocus
                    type="textarea"
                    @blur="saveEdit"
                    @keyup.enter="saveEdit"
                    @keyup.esc="cancelEdit"
                  />
                </div>
                <div
                  v-else
                  class="tw:mt-3 tw:text-sm tw:font-medium tw:text-on-main tw:border-b tw:border-divider tw:pb-1 tw:cursor-pointer tw:hover:bg-main-hover tw:px-2 tw:-mx-2 tw:rounded tw:min-h-5"
                  @click="startEdit('description')"
                >
                  {{ template.description || 'Click to add description...' }}
                </div>
              </div>
            </div>
          </div>

          <!-- Classification -->
          <div class="tw:space-y-4 tw:pt-4 tw:border-t tw:border-divider">
            <h4 class="ds-label-sm tw:text-secondary">Classification</h4>
            <div class="tw:grid tw:gap-4">
              <div class="tw:space-y-1 tw:flex tw:flex-col">
                <label class="tw:text-xs tw:font-medium tw:text-secondary">Template Code</label>
                <div
                  class="tw:text-xs tw:font-mono tw:bg-main-hover tw:px-2 tw:py-1 tw:rounded tw:text-on-main tw:inline-flex tw:w-fit"
                >
                  {{ template.code }}
                </div>
              </div>
              <div class="tw:space-y-1">
                <label class="tw:text-xs tw:font-medium tw:text-secondary">Status</label>
                <div v-if="editingField === 'statusId'">
                  <WSelect
                    v-model="editValue"
                    :options="statusOptions"
                    mapOptions
                    emitValue
                    dense
                    autofocus
                    optionLabel="name"
                    optionValue="id"
                    @update:modelValue="saveEdit"
                    @blur="cancelEdit"
                  />
                </div>
                <div
                  v-else
                  class="tw:cursor-pointer tw:hover:bg-main-hover tw:px-2 tw:-mx-2 tw:rounded"
                  @click="startEdit('statusId')"
                >
                  <WStatusBadge :status="template.statusId" variant="formTemplate" showDot />
                </div>
              </div>
              <!-- Assigned Sites -->
              <div class="tw:space-y-1">
                <label class="tw:text-xs tw:font-medium tw:text-secondary">Assigned Sites</label>
                <div v-if="editingField === 'siteIds'">
                  <FormTemplatesSiteSelect
                    v-model:siteId="editValue"
                    :multiple="true"
                    :required="true"
                    autofocus
                    @update:modelValue="saveEdit"
                    @blur="cancelEdit"
                  />
                </div>
                <div
                  v-else
                  class="tw:cursor-pointer tw:hover:bg-main-hover tw:px-2 tw:-mx-2 tw:rounded"
                  @click="startEdit('siteIds')"
                >
                  <div class="tw:flex tw:flex-wrap tw:gap-1">
                    <span
                      v-for="site in template.sites"
                      :key="site.id"
                      class="tw:text-xs tw:bg-gray-100 tw:dark:bg-gray-700 tw:px-2 tw:py-0.5 tw:rounded-full tw:text-gray-700 tw:dark:text-gray-300"
                    >
                      {{ site.name }}
                    </span>
                    <span
                      v-if="!template.sites || template.sites.length === 0"
                      class="tw:text-sm tw:text-gray-500"
                    >
                      No sites assigned
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- JSON Configuration -->
          <div
            v-if="template.config && Object.keys(template.config).length"
            class="tw:space-y-4 tw:pt-4 tw:border-t tw:border-divider"
          >
            <h4 class="ds-label-sm tw:text-secondary">JSON Configuration</h4>
            <div class="tw:rounded-lg tw:bg-[#111827] tw:p-3 tw:overflow-hidden">
              <pre
                class="tw:text-[10px] tw:text-good tw:font-mono tw:leading-relaxed tw:whitespace-pre-wrap"
              ><code>{{ JSON.stringify(template.config, null, 2) }}</code></pre>
            </div>
          </div>

          <!-- System Info -->
          <div class="tw:p-4 tw:bg-main tw:rounded-lg">
            <div class="tw:flex tw:flex-col tw:gap-2">
              <div class="tw:flex tw:justify-between tw:text-[11px]">
                <span class="tw:text-secondary">Last Modified</span>
                <span class="tw:font-bold tw:text-on-main">{{ relativeUpdatedAt }}</span>
              </div>

              <div class="tw:flex tw:justify-between tw:text-[11px]">
                <span class="tw:text-secondary">Created Date</span>
                <span class="tw:font-bold tw:text-on-main">{{ formattedCreatedAt }}</span>
              </div>

              <div class="tw:flex tw:justify-between tw:text-[11px]">
                <span class="tw:text-secondary">Version</span>
                <span class="tw:font-bold tw:text-on-main">{{ template.version }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>

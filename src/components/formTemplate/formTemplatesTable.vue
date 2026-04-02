<script setup>
import { getCompanyPath } from '@/utils/routeHelpers'
import { currentCompany } from '@/utils/currentCompany.js'
import { useQuasar } from 'quasar'
import { isAllowed } from '@/utils/currentSession.js'
import { get } from '@/api'

// Props

// Emits

// Composables
const $q = useQuasar()
const router = useRouter()
const { updateTemplate, templates: rows, loading, deleteTemplate } = useFormTemplates()
const { statusOptions, fetchFormStatuses } = useTemplateForm()

const canUpdateTemplate = computed(() => isAllowed(['formTemplates:update']))
const canDeleteTemplate = computed(() => isAllowed(['formTemplates:delete']))

// Refs
const columns = [
  { name: 'title', label: 'TEMPLATE NAME', field: 'title', align: 'left', sortable: true },
  { name: 'version', label: 'VERSION', field: 'version', align: 'left', sortable: true },
  { name: 'statusId', label: 'STATUS', field: 'statusId', align: 'left', sortable: true },
  { name: 'createdAt', label: 'CREATED', field: 'createdAt', align: 'left', sortable: true },
  { name: 'actions', label: 'ACTIONS', field: 'actions', align: 'right' },
]

const showPreviewDialog = ref(false)
const previewTemplate = ref(null)
const previewLoading = ref(false)
const editingRowId = ref(null)
const editingField = ref(null)
const editValue = ref(null)

// Computed
const previewSchema = computed(() => {
  if (!previewTemplate.value?.schema) return []
  return Array.isArray(previewTemplate.value.schema) ? previewTemplate.value.schema : []
})

const previewTitle = computed(() => {
  if (!previewTemplate.value) return 'Form Preview'
  return `Preview: ${previewTemplate.value.title} (v${previewTemplate.value.version})`
})

// Functions
function navigateToTemplate(row, mode) {
  const path = getCompanyPath(`/templates/${row.id}`)
  const query = mode ? { mode } : undefined
  router.push({ path, query })
}

async function openPreview(row) {
  showPreviewDialog.value = true
  previewTemplate.value = null

  const data = await get(`/v1/services/formTemplates/${row.id}`, {
    params: { companyId: currentCompany.value.id },
    loader: previewLoading,
  })
  previewTemplate.value = data.formTemplate
}

function startEdit(row, field) {
  if (!canUpdateTemplate.value) return
  editingRowId.value = row.id
  editingField.value = field
  editValue.value = row[field]
}

async function saveEdit(row) {
  if (!editingRowId.value || !editingField.value) return

  const success = await updateTemplate(row.id, {
    [editingField.value]: editValue.value,
  })

  if (success) {
    cancelEdit()
  }
}

function cancelEdit() {
  editingRowId.value = null
  editingField.value = null
  editValue.value = null
}

async function handleDelete(template) {
  $q.dialog({
    title: 'Confirm Deletion',
    message: `Are you sure you want to delete form template "${template.title}" (${template.code})? This action cannot be undone.`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const success = await deleteTemplate(template.id)
    if (success) {
      $q.notify({
        type: 'positive',
        message: 'Form template deleted successfully',
      })
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
  <QCard flat bordered>
    <!-- Templates Table -->
    <WTable :rows="rows" :columns="columns" class="tw:flex-1" :loading="loading" hideTop noBorder>
      <!-- Title Column -->
      <template #body-cell-title="slotProps">
        <QTd :props="slotProps">
          <div
            v-if="editingRowId === slotProps.row.id && editingField === 'title'"
            class="tw:flex tw:items-center tw:gap-2"
          >
            <WInput
              v-model="editValue"
              autofocus
              dense
              class="tw:flex-1"
              @keyup.enter="saveEdit(slotProps.row)"
              @keyup.esc="cancelEdit"
              @blur="saveEdit(slotProps.row)"
            />
          </div>
          <div
            v-else
            class="tw:flex tw:flex-col"
            :class="canUpdateTemplate ? 'tw:cursor-pointer' : ''"
            @click="canUpdateTemplate && startEdit(slotProps.row, 'title')"
          >
            <span class="tw:font-bold tw:text-on-main">{{ slotProps.row.title }}</span>
            <span class="tw:text-xs tw:text-secondary">{{ slotProps.row.code }}</span>
          </div>
        </QTd>
      </template>

      <!-- Version Column -->
      <template #body-cell-version="slotProps">
        <QTd :props="slotProps">
          <span class="tw:text-sm tw:text-secondary tw:font-mono">
            v{{ slotProps.row.version }}
          </span>
        </QTd>
      </template>

      <!-- Status Column -->
      <template #body-cell-statusId="slotProps">
        <QTd :props="slotProps">
          <div
            v-if="editingRowId === slotProps.row.id && editingField === 'statusId'"
            class="tw:flex tw:items-center tw:gap-2"
          >
            <WSelect
              v-model="editValue"
              :options="statusOptions"
              mapOptions
              emitValue
              dense
              class="tw:flex-1"
              autofocus
              optionLabel="name"
              optionValue="id"
              @update:modelValue="saveEdit(slotProps.row)"
              @blur="cancelEdit"
            />
          </div>
          <div
            v-else
            :class="canUpdateTemplate ? 'tw:cursor-pointer' : ''"
            @click="canUpdateTemplate && startEdit(slotProps.row, 'statusId')"
          >
            <WStatusBadge :status="slotProps.row.statusId" variant="formTemplate" showDot />
          </div>
        </QTd>
      </template>

      <!-- Created At Column -->
      <template #body-cell-createdAt="slotProps">
        <QTd :props="slotProps">
          <span class="tw:text-sm tw:text-secondary">{{
            slotProps.row.createdAt.formatDate('date')
          }}</span>
        </QTd>
      </template>

      <!-- Actions Column -->
      <template #body-cell-actions="slotProps">
        <QTd :props="slotProps">
          <div class="tw:flex tw:justify-end">
            <WBtn flat round dense color="grey-6" icon="more_vert">
              <QMenu>
                <QList dense style="min-width: 160px">
                  <QItem v-close-popup clickable @click="navigateToTemplate(slotProps.row)">
                    <QItemSection>
                      <div class="tw:flex tw:items-center tw:gap-2">
                        <WIcon name="edit" size="20px" color="primary" />
                        <div>View</div>
                      </div>
                    </QItemSection>
                  </QItem>
                  <QItem
                    v-if="canUpdateTemplate"
                    v-close-popup
                    clickable
                    @click="navigateToTemplate(slotProps.row, 'schema')"
                  >
                    <QItemSection>
                      <div class="tw:flex tw:items-center tw:gap-2">
                        <WIcon name="design_services" size="20px" color="primary" />
                        <div>Design</div>
                      </div>
                    </QItemSection>
                  </QItem>
                  <QItem v-close-popup clickable @click="openPreview(slotProps.row)">
                    <QItemSection>
                      <div class="tw:flex tw:items-center tw:gap-2">
                        <WIcon name="visibility" size="20px" color="grey-7" />
                        <div>Preview</div>
                      </div>
                    </QItemSection>
                  </QItem>
                  <QItem
                    v-if="canDeleteTemplate"
                    v-close-popup
                    clickable
                    class="tw:text-bad"
                    @click="handleDelete(slotProps.row)"
                  >
                    <QItemSection>
                      <div class="tw:flex tw:items-center tw:gap-2">
                        <WIcon name="delete" size="20px" />
                        <div>Delete</div>
                      </div>
                    </QItemSection>
                  </QItem>
                </QList>
              </QMenu>
            </WBtn>
          </div>
        </QTd>
      </template>
    </WTable>
  </QCard>

  <!-- Preview Dialog -->
  <QDialog v-model="showPreviewDialog" maximized>
    <FormTemplatePreview
      :title="previewTitle"
      :schema="previewSchema"
      :loading="previewLoading"
      @submit="showPreviewDialog = false"
      @close="showPreviewDialog = false"
    />
  </QDialog>
</template>

<style scoped lang="scss">
.hover-link:hover {
  color: var(--q-primary);
  text-decoration: underline;
}
</style>

<script setup>
import { useFormBuilder } from '@/composables/useFormBuilder'
import FormFieldPalette from './FormFieldPalette.vue'
import FormCanvas from './FormCanvas.vue'
import FormFieldConfig from './FormFieldConfig.vue'
import DynamicForm from '@/components/form/DynamicForm.js'
import { useQuasar } from 'quasar'

const props = defineProps({
  title: {
    type: String,
    default: 'Form Builder',
  },
  initialSchema: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['save', 'update:schema'])

const $q = useQuasar()

const {
  schema,
  selectedField,
  selectedFieldPath,
  isDragging,
  addField,
  removeField,
  moveField,
  selectField,
  clearSelection,
  duplicateField,
  undo,
  redo,
  canUndo,
  canRedo,
  exportSchema,
  clearSchema,
} = useFormBuilder(props.initialSchema)

const leftDrawerOpen = ref(false)
const rightDrawerOpen = ref(false)
const showPreview = ref(false)
const showJsonDialog = ref(false)
const showClearDialog = ref(false)
const previewData = ref({})

const jsonContent = computed({
  get: () => JSON.stringify(schema.value, null, 2),
  set: () => {},
})

// Watch schema changes and emit
watch(
  schema,
  (newSchema) => {
    emit('update:schema', newSchema)
  },
  { deep: true },
)

// Watch selectedField to open right drawer
watch(selectedField, (field) => {
  if (field) {
    rightDrawerOpen.value = true
  }
})

function onDragStart() {
  isDragging.value = true
}

function onDragEnd() {
  isDragging.value = false
}

function onAddFieldFromClick(fieldType) {
  addField(fieldType)
}

function handleSelectField(path) {
  selectField(path)
  rightDrawerOpen.value = true
}

function closeRightDrawer() {
  rightDrawerOpen.value = false
  clearSelection()
}

function togglePreview() {
  showPreview.value = !showPreview.value
  if (showPreview.value) {
    clearSelection()
    rightDrawerOpen.value = false
  }
}

function onSave() {
  const schemaData = exportSchema()
  if (validateSchema(schemaData)) {
    emit('save', schemaData)
  }
}

function validateSchema(fields) {
  for (const field of fields) {
    // Check if field has a name
    if (!field.name || field.name.trim() === '') {
      $q.notify({
        type: 'negative',
        message: `Field "${field.label || field.type}" is missing a name`,
        caption: 'All fields must have a unique name',
      })
      return false
    }

    // Check Options (Select, Radio, OptionGroup)
    if (field.options && Array.isArray(field.options)) {
      for (const [index, option] of field.options.entries()) {
        const val = typeof option === 'object' ? option?.value : option
        if (!val || String(val).trim() === '') {
          $q.notify({
            type: 'negative',
            message: `Option ${index + 1} in field "${field.label || field.name}" is missing a value`,
          })
          return false
        }
      }
    }

    // Check Checklist Rows
    if (field.rows && Array.isArray(field.rows)) {
      for (const [index, row] of field.rows.entries()) {
        const val = typeof row === 'object' ? row?.value : row
        if (!val || String(val).trim() === '') {
          $q.notify({
            type: 'negative',
            message: `Row ${index + 1} in field "${field.label || field.name}" is missing a value`,
          })
          return false
        }
      }
    }

    // Check Checklist Columns
    if (field.columns && Array.isArray(field.columns)) {
      for (const [colIndex, col] of field.columns.entries()) {
        if (!col.value || String(col.value).trim() === '') {
          $q.notify({
            type: 'negative',
            message: `Column ${colIndex + 1} in field "${field.label || field.name}" is missing a value`,
          })
          return false
        }

        // Check Column Options (for dropdown type columns)
        if (col.options && Array.isArray(col.options)) {
          for (const [optIndex, option] of col.options.entries()) {
            const val = typeof option === 'object' ? option?.value : option
            if (!val || String(val).trim() === '') {
              $q.notify({
                type: 'negative',
                message: `Option ${optIndex + 1} in Column "${col.label || col.value}" (Field: "${field.label || field.name}") is missing a value`,
              })
              return false
            }
          }
        }
      }
    }

    // Check children recursively
    if (field.children && field.children.length > 0) {
      if (!validateSchema(field.children)) return false
    }

    // Check template (repeater) recursively
    if (field.template && field.template.length > 0) {
      if (!validateSchema(field.template)) return false
    }
  }
  return true
}

function onPreviewSubmit(data) {
  $q.notify({
    type: 'positive',
    message: 'Form submitted!',
    caption: 'Check console for form data',
  })
  console.info('Form Data:', data)
}

function confirmClear() {
  if (schema.value.length > 0) {
    showClearDialog.value = true
  }
}

function doClear() {
  clearSchema()
  showClearDialog.value = false
}

function copyJson() {
  navigator.clipboard.writeText(jsonContent.value)
  $q.notify({
    type: 'positive',
    message: 'JSON copied to clipboard',
  })
}
</script>

<template>
  <div class="tw:flex tw:h-screen tw:bg-main tw:overflow-hidden">
    <!-- Left Sidebar - Field Palette -->
    <Transition name="slide-left">
      <aside
        v-if="leftDrawerOpen"
        class="tw:w-80 tw:border-r tw:border-divider tw:bg-sidebar tw:flex tw:flex-col tw:shrink-0"
      >
        <FormFieldPalette
          :isDragging="isDragging"
          @dragStart="onDragStart"
          @dragEnd="onDragEnd"
          @fieldClick="onAddFieldFromClick"
        />
      </aside>
    </Transition>

    <!-- Main Content Area -->
    <div class="tw:flex tw:flex-1 tw:flex-col tw:overflow-hidden">
      <!-- Header -->
      <header
        class="tw:sticky tw:top-0 tw:z-20 tw:px-4 tw:py-2 tw:bg-sidebar tw:border-b tw:border-divider"
      >
        <div class="tw:flex tw:items-center tw:justify-between">
          <div class="tw:flex tw:items-center tw:gap-3">
            <WBtn flat round dense icon="menu" @click="leftDrawerOpen = !leftDrawerOpen">
              <QTooltip>Toggle Fields Panel</QTooltip>
            </WBtn>

            <div class="tw:text-lg tw:font-bold tw:text-on-sidebar">
              <slot name="title">
                {{ title || 'Form Builder' }}
              </slot>
            </div>
          </div>

          <div class="tw:flex tw:items-center tw:gap-3">
            <div class="tw:flex tw:items-center tw:gap-1">
              <WBtn flat round dense icon="undo" :disable="!canUndo" @click="undo">
                <QTooltip>Undo</QTooltip>
              </WBtn>
              <WBtn flat round dense icon="redo" :disable="!canRedo" @click="redo">
                <QTooltip>Redo</QTooltip>
              </WBtn>
            </div>

            <div class="tw:w-px tw:h-6 tw:bg-divider tw:mx-1" />

            <div class="tw:flex tw:items-center tw:gap-1">
              <WBtn
                flat
                round
                dense
                :icon="showPreview ? 'edit' : 'visibility'"
                :color="showPreview ? 'primary' : 'grey-7'"
                @click="togglePreview"
              >
                <QTooltip>{{ showPreview ? 'Edit Mode' : 'Preview' }}</QTooltip>
              </WBtn>

              <WBtn flat round dense icon="code" @click="showJsonDialog = true">
                <QTooltip>View JSON</QTooltip>
              </WBtn>

              <WBtn flat round dense icon="delete_outline" color="negative" @click="confirmClear">
                <QTooltip>Clear All</QTooltip>
              </WBtn>
            </div>

            <div class="tw:w-px tw:h-6 tw:bg-divider tw:mx-2" />

            <WBtn
              unelevated
              icon="save"
              label="Save"
              color="primary"
              class="tw:px-6 tw:font-bold"
              @click="onSave"
            />
          </div>
        </div>
      </header>

      <!-- Content + Right Sidebar -->
      <div class="tw:flex tw:flex-1 tw:overflow-hidden">
        <!-- Canvas Area -->
        <div class="tw:flex-1 tw:overflow-auto tw:bg-main tw:p-4">
          <!-- Edit Mode - Canvas -->
          <div v-if="!showPreview" class="tw:max-w-4xl tw:mx-auto tw:min-h-full">
            <FormCanvas
              v-model="previewData"
              :fields="schema"
              :selectedPath="selectedFieldPath"
              :isDragging="isDragging"
              @addField="addField"
              @selectField="handleSelectField"
              @removeField="removeField"
              @duplicateField="duplicateField"
              @moveField="moveField"
            />
          </div>

          <!-- Preview Mode -->
          <div v-else class="tw:py-6 tw:px-4 tw:min-h-full">
            <div
              class="tw:max-w-4xl tw:mx-auto tw:bg-sidebar tw:border tw:border-divider tw:rounded-2xl tw:shadow-xl tw:overflow-hidden"
            >
              <div class="tw:bg-main tw:px-5 tw:py-3 tw:border-b tw:border-divider">
                <div class="tw:text-xl tw:font-bold tw:text-on-sidebar">Form Preview</div>
              </div>
              <div class="tw:p-5">
                <DynamicForm v-model="previewData" :fields="schema" @submit="onPreviewSubmit">
                  <template #footer>
                    <div
                      class="tw:flex tw:justify-end tw:mt-5 tw:pt-4 tw:border-t tw:border-divider"
                    >
                      <WBtn
                        type="submit"
                        color="primary"
                        label="Submit Application"
                        size="lg"
                        unelevated
                        class="tw:px-10"
                      />
                    </div>
                  </template>
                </DynamicForm>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Sidebar - Field Config -->
        <Transition name="slide-right">
          <aside
            v-if="rightDrawerOpen"
            class="tw:w-96 tw:border-l tw:border-divider tw:bg-sidebar tw:flex! tw:flex-col tw:shrink-0 tw:overflow-hidden"
          >
            <div
              class="tw:flex tw:items-center tw:justify-between tw:px-4 tw:py-3 tw:border-b tw:border-divider tw:bg-main/50"
            >
              <div class="tw:text-lg tw:font-bold tw:text-on-sidebar">Field Settings</div>
              <WBtn flat round dense icon="close" size="sm" @click="closeRightDrawer" />
            </div>
            <div class="tw:flex tw:flex-col tw:grow tw:overflow-y-auto">
              <FormFieldConfig v-model:field="selectedField" :path="selectedFieldPath" />
            </div>
          </aside>
        </Transition>
      </div>
    </div>

    <!-- JSON Dialog -->
    <QDialog v-model="showJsonDialog" maximized>
      <div class="tw:flex tw:flex-col tw:h-full tw:bg-sidebar">
        <div
          class="tw:flex tw:items-center tw:justify-between tw:px-4 tw:py-3 tw:border-b tw:border-divider"
        >
          <div class="tw:text-xl tw:font-bold">Form Schema JSON</div>
          <WBtn flat round dense icon="close" @click="showJsonDialog = false" />
        </div>
        <div class="tw:grow tw:overflow-hidden tw:p-5">
          <div
            class="tw:h-full tw:bg-main tw:rounded-2xl tw:border tw:border-divider tw:overflow-hidden tw:flex tw:flex-col"
          >
            <div
              class="tw:flex tw:items-center tw:justify-between tw:px-4 tw:py-2 tw:bg-divider/20 tw:border-b tw:border-divider"
            >
              <div class="ds-label-sm tw:text-secondary">Schema Output</div>
              <WBtn
                flat
                dense
                icon="content_copy"
                label="Copy JSON"
                color="primary"
                size="sm"
                @click="copyJson"
              />
            </div>
            <pre
              class="tw:flex-1 tw:p-4 tw:overflow-auto tw:font-mono tw:text-sm tw:leading-relaxed tw:text-on-main"
            ><code>{{ jsonContent }}</code></pre>
          </div>
        </div>
      </div>
    </QDialog>

    <!-- Clear Confirmation Dialog -->
    <QDialog v-model="showClearDialog">
      <div class="tw:bg-sidebar tw:rounded-2xl tw:max-w-sm tw:overflow-hidden tw:shadow-2xl">
        <div class="tw:p-5">
          <div class="tw:flex tw:items-center tw:gap-3 tw:mb-3">
            <div
              class="tw:w-12 tw:h-12 tw:bg-bad/10 tw:text-bad tw:rounded-full tw:flex tw:items-center tw:justify-center"
            >
              <WIcon icon="warning" size="24px" />
            </div>
            <div class="tw:text-2xl tw:font-bold tw:text-on-sidebar">Clear Form?</div>
          </div>
          <div class="tw:text-secondary tw:leading-relaxed">
            Are you sure you want to clear all fields? This action will remove all current content
            and cannot be undone.
          </div>
        </div>
        <div class="tw:flex tw:justify-end tw:gap-3 tw:px-5 tw:pb-5">
          <WBtn flat label="Keep Current" color="grey-7" @click="showClearDialog = false" />
          <WBtn unelevated label="Delete All" color="negative" @click="doClear" />
        </div>
      </div>
    </QDialog>
  </div>
</template>

<style lang="scss" scoped>
/* Slide transitions for sidebars */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-left-enter-from,
.slide-left-leave-to {
  width: 0 !important;
  opacity: 0;
  transform: translateX(-20px);
}

.slide-right-enter-from,
.slide-right-leave-to {
  width: 0 !important;
  opacity: 0;
  transform: translateX(20px);
}
</style>

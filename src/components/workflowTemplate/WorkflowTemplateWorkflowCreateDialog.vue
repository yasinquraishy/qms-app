<script setup>
import { IconLayoutKanban } from '@tabler/icons-vue'
import { required, helpers } from '@vuelidate/validators'
import { useValidator } from '@shared/composables/validator.js'

const emit = defineEmits(['created'])

const show = defineModel({ type: Boolean, default: false })

const form = ref({
  name: '',
  description: '',
  moduleId: null,
  documentTypeId: null,
})

const rules = computed(() => ({
  name: { required: helpers.withMessage('Workflow name is required', required) },
}))

const validator = useValidator(rules, form)

const loading = ref(false)

const isFormValid = computed(() => {
  return form.value.name.trim() && form.value.moduleId && form.value.documentTypeId
})

const createWorkflowAndVersion = useLiveMutation(
  async (db, { name, description, moduleId, documentTypeId }) => {
    const workflow = db.WorkflowTemplate.create({
      name,
      description,
      moduleId,
      documentTypeId,
      statusId: 'ACTIVE',
    })
    await workflow.save()
    const version = db.WorkflowTemplateVersion.create({
      workflowId: workflow.id,
      versionMajor: 1,
      versionMinor: 0,
      statusId: 'DRAFT',
    })
    await version.save()
    return workflow
  },
)

async function handleSubmit() {
  const valid = await validator.value.$validate()
  if (!valid || !isFormValid.value) return

  loading.value = true
  try {
    const workflow = await createWorkflowAndVersion({
      name: form.value.name.trim(),
      description: form.value.description.trim() || '',
      moduleId: form.value.moduleId,
      documentTypeId: form.value.documentTypeId,
    })
    if (workflow) {
      emit('created', workflow)
      resetForm()
      show.value = false
    }
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.value = { name: '', description: '', moduleId: null, documentTypeId: null }
}
</script>

<template>
  <BaseDialog v-model="show" title="Create Workflow" maxWidth="md" @hide="resetForm">
    <template #title>
      <div class="tw:flex tw:items-center tw:gap-3">
        <div
          class="tw:w-9 tw:h-9 tw:bg-primary/10 tw:text-primary tw:rounded-xl tw:flex tw:items-center tw:justify-center"
        >
          <IconLayoutKanban :size="20" />
        </div>
        <span>Create Workflow</span>
      </div>
    </template>

    <div class="tw:flex tw:flex-col tw:gap-4">
      <p class="tw:text-sm tw:text-secondary tw:leading-relaxed">
        Define a new approval workflow to manage multi-step document approvals.
      </p>

      <div class="tw:flex tw:flex-col tw:gap-4">
        <!-- Name -->
        <BaseTextInput
          v-model="form.name"
          name="name"
          label="Workflow Name"
          placeholder="e.g. Global SOP Multi-Stage Approval"
          autofocus
          required
        />

        <div class="tw:grid tw:grid-cols-2 tw:gap-4">
          <!-- Module -->
          <div>
            <label class="tw:block tw:text-xs tw:font-semibold tw:text-secondary tw:mb-1.5">
              Module <span class="tw:text-bad">*</span>
            </label>
            <ModuleSelectMenu v-model="form.moduleId" required />
          </div>

          <!-- Document Type -->
          <div>
            <label class="tw:block tw:text-xs tw:font-semibold tw:text-secondary tw:mb-1.5">
              Document Type <span class="tw:text-bad">*</span>
            </label>
            <DocumentTypeSelectMenu v-model="form.documentTypeId" required />
          </div>
        </div>

        <!-- Description -->
        <BaseTextarea
          v-model="form.description"
          label="Description"
          placeholder="Describe the purpose of this workflow"
        />
      </div>
    </div>

    <template #footer="{ close }">
      <BaseButton variant="outline" @click="close">Cancel</BaseButton>
      <BaseButton :isLoading="loading" :disabled="!isFormValid" @click="handleSubmit">
        Create Workflow
      </BaseButton>
    </template>
  </BaseDialog>
</template>

<script setup>
import { required, helpers } from '@vuelidate/validators'
import { useValidator } from '@shared/composables/validator.js'
import { useApprovalWorkflows } from '@/composables/useApprovalWorkflows.js'

const emit = defineEmits(['created'])

const show = defineModel({ type: Boolean, default: false })

const { createWorkflow } = useApprovalWorkflows()

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

async function handleSubmit() {
  const valid = await validator.value.$validate()
  if (!valid || !isFormValid.value) return

  loading.value = true
  try {
    const payload = {
      name: form.value.name.trim(),
      description: form.value.description.trim() || '',
      moduleId: form.value.moduleId,
      documentTypeId: form.value.documentTypeId,
    }

    const result = await createWorkflow(payload)

    if (result.workflow) {
      emit('created', result.workflow)
      resetForm()
      show.value = false
    }
  } catch {
    // Error handled in composable
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.value = { name: '', description: '', moduleId: null, documentTypeId: null }
}

function handleClose() {
  resetForm()
  show.value = false
}
</script>

<template>
  <QDialog v-model="show" transitionShow="scale" transitionHide="scale" @hide="resetForm">
    <div class="tw:bg-main tw:rounded-2xl tw:overflow-hidden tw:shadow-2xl tw:max-w-md tw:w-full">
      <div class="tw:p-5 tw:flex tw:flex-col tw:gap-4">
        <!-- Header -->
        <div class="tw:flex tw:items-center tw:gap-3">
          <div
            class="tw:w-10 tw:h-10 tw:bg-primary/10 tw:text-primary tw:rounded-xl tw:flex tw:items-center tw:justify-center"
          >
            <WIcon icon="add_circle" size="24px" />
          </div>
          <div class="tw:text-2xl tw:font-bold tw:text-on-main">Create Workflow</div>
        </div>

        <div class="tw:text-sm tw:text-secondary tw:leading-relaxed">
          Define a new approval workflow to manage multi-step document approvals.
        </div>

        <QForm class="tw:flex tw:flex-col tw:gap-4" @submit="handleSubmit">
          <!-- Name -->
          <WInput
            v-model="form.name"
            name="name"
            label="Workflow Name"
            placeholder="e.g. Global SOP Multi-Stage Approval"
            autofocus
          >
            <template #label> Workflow Name <span class="tw:text-bad">*</span> </template>
          </WInput>

          <div class="tw:grid tw:grid-cols-1 tw:md:grid-cols-2 tw:gap-4">
            <!-- Module -->
            <ApprovalWorkflowsModuleSelect v-model:moduleId="form.moduleId" required />

            <!-- Document Type -->
            <FormTemplatesDocumentTypeSelect
              v-model:documentTypeId="form.documentTypeId"
              required
            />
          </div>

          <!-- Description -->
          <WInput
            v-model="form.description"
            label="Description"
            placeholder="Describe the purpose of this workflow"
            type="textarea"
            class="tw:min-h-24"
          />
        </QForm>

        <!-- Actions -->
        <div class="tw:flex tw:justify-end tw:gap-3 tw:mt-2">
          <WBtn flat label="Cancel" color="grey-7" @click="handleClose" />
          <WBtn
            label="Create Workflow"
            color="primary"
            unelevated
            class="tw:px-6 tw:font-bold"
            :loading="loading"
            :disable="!isFormValid"
            @click="handleSubmit"
          />
        </div>
      </div>
    </div>
  </QDialog>
</template>

<script setup>
import { IconRouteSquare2 } from '@tabler/icons-vue'
import { required, helpers } from '@vuelidate/validators'
import { useValidator } from '@shared/composables/validator.js'

const emit = defineEmits(['created'])

const show = defineModel({ type: Boolean, default: false })

const form = ref({
  name: '',
  description: '',
})

const rules = computed(() => ({
  name: { required: helpers.withMessage('Template name is required', required) },
}))

const validator = useValidator(rules, form)

const loading = ref(false)

const isFormValid = computed(() => form.value.name.trim().length > 0)

const createTemplateAndVersion = useLiveMutation(async (db, { name, description }) => {
  const template = db.NcWorkflowTemplate.create({
    name,
    description,
    statusId: 'ACTIVE',
  })
  await template.save()
  const version = db.NcWorkflowTemplateVersion.create({
    workflowTemplateId: template.id,
    versionMajor: 1,
    versionMinor: 0,
    statusId: 'DRAFT',
  })
  await version.save()
  return template
})

async function handleSubmit() {
  const valid = await validator.value.$validate()
  if (!valid || !isFormValid.value) return

  loading.value = true
  try {
    const template = await createTemplateAndVersion({
      name: form.value.name.trim(),
      description: form.value.description.trim() || '',
    })
    if (template) {
      emit('created', template)
      resetForm()
      show.value = false
    }
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.value = { name: '', description: '' }
}
</script>

<template>
  <BaseDialog v-model="show" title="Create NC Workflow Template" maxWidth="md" @hide="resetForm">
    <template #title>
      <div class="tw:flex tw:items-center tw:gap-3">
        <div
          class="tw:w-9 tw:h-9 tw:bg-primary/10 tw:text-primary tw:rounded-xl tw:flex tw:items-center tw:justify-center"
        >
          <IconRouteSquare2 :size="20" />
        </div>
        <span>Create NC Workflow Template</span>
      </div>
    </template>

    <div class="tw:flex tw:flex-col tw:gap-4">
      <p class="tw:text-sm tw:text-secondary tw:leading-relaxed">
        Define a new workflow template to manage stage-based NC processing.
      </p>

      <div class="tw:flex tw:flex-col tw:gap-4">
        <!-- Name -->
        <BaseTextInput
          v-model="form.name"
          name="name"
          label="Template Name"
          placeholder="e.g. Standard NC Workflow"
          autofocus
          required
        />

        <!-- Description -->
        <BaseTextarea
          v-model="form.description"
          label="Description"
          placeholder="Describe the purpose of this workflow template"
        />
      </div>
    </div>

    <template #footer="{ close }">
      <BaseButton variant="outline" @click="close">Cancel</BaseButton>
      <BaseButton :isLoading="loading" :disabled="!isFormValid" @click="handleSubmit">
        Create Template
      </BaseButton>
    </template>
  </BaseDialog>
</template>

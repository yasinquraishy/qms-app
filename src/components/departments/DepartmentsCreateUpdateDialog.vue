<script setup>
import { useDebounceFn } from '@vueuse/core'
import { useQuasar } from 'quasar'
import { required, helpers } from '@vuelidate/validators'
import { useValidator } from '@shared/composables/validator.js'
import { useDepartments } from '@/composables/useDepartments.js'

const props = defineProps({
  id: {
    type: [String, Number],
    default: null,
  },
})

const emit = defineEmits(['created', 'updated'])

const open = defineModel({
  type: Boolean,
  default: false,
})

const { checkCodeAvailability, createDepartment, updateDepartment, departments } = useDepartments()
const $q = useQuasar()

// Dialog State (handled by defineModel above)

const form = ref({
  name: '',
  code: '',
  siteId: null,
  description: '',
  displayOrder: 1000,
})

const rules = computed(() => ({
  name: { required: helpers.withMessage('Required', required) },
  code: { required: helpers.withMessage('Required', required) },
  siteId: { required: helpers.withMessage('Required', required) },
}))

const validator = useValidator(rules, form)

const isChecking = ref(false)
const isAvailable = ref(null) // null | true | false
const isSubmitting = ref(false)

const isEdit = computed(() => !!props.id)

// Load department data if editing
watch(
  () => props.id,
  (newId) => {
    if (newId) {
      const department = departments.value.find((d) => d.id === newId)
      if (department) {
        form.value = {
          name: department.name,
          code: department.code,
          siteId: department.siteId,
          description: department.description || '',
          displayOrder: department.displayOrder || 1000,
        }
        isAvailable.value = true // Existing code is valid
      }
    }
  },
  { immediate: true },
)

// Reset form when closed
watch(open, (val) => {
  if (!val) {
    if (!props.id) {
      form.value = {
        name: '',
        code: '',
        siteId: null,
        description: '',
        displayOrder: 1000,
      }
      isAvailable.value = null
    }
  }
})

// Auto-check availability when code changes (debounced)
const checkAvailabilityDebounced = useDebounceFn(async (newCode) => {
  if (!newCode || newCode.trim().length < 2) return

  isChecking.value = true
  const result = await checkCodeAvailability(newCode.trim(), '', false, props.id)
  isChecking.value = false
  if (result && result.message === 'available') {
    isAvailable.value = true
  } else {
    isAvailable.value = false
  }
}, 500)

watch(
  () => form.value.code,
  (newCode) => {
    isAvailable.value = null
    checkAvailabilityDebounced(newCode)
  },
)

// Auto-suggest code when name changes
async function onNameBlur() {
  if (!form.value.name || form.value.code) return

  const result = await checkCodeAvailability(null, form.value.name, true)
  if (result && result.suggestedCode) {
    form.value.code = result.suggestedCode
    // Trigger code availability check explicitly as setting it programmatically might need validation
  }
}

async function onSubmit() {
  const valid = await validator.value.$validate()
  if (!valid || isAvailable.value !== true) return

  isSubmitting.value = true
  let result
  if (isEdit.value) {
    result = await updateDepartment(props.id, {
      name: form.value.name,
      siteId: form.value.siteId,
      description: form.value.description,
      displayOrder: form.value.displayOrder || 1000,
    })
  } else {
    result = await createDepartment({
      name: form.value.name,
      code: form.value.code,
      siteId: form.value.siteId,
      description: form.value.description,
      displayOrder: form.value.displayOrder || 1000,
    })
  }
  isSubmitting.value = false

  if (result.error) {
    $q.notify({
      type: 'negative',
      message: result.error,
    })
  } else {
    $q.notify({
      type: 'positive',
      message: isEdit.value ? 'Department updated successfully' : 'Department created successfully',
    })
    if (isEdit.value) {
      emit('updated', result.department)
    } else {
      emit('created', result.department)
    }
    open.value = false
  }
}
</script>

<template>
  <WDialog v-model="open" :title="isEdit ? 'Edit Department' : 'Create New Department'">
    <div class="tw:flex tw:flex-col tw:gap-4">
      <WInput
        v-model="form.name"
        name="name"
        label="Department Name"
        placeholder="e.g. Quality Assurance"
        @blur="onNameBlur"
      >
        <template #label> Department Name <span class="tw:text-bad">*</span> </template>
      </WInput>

      <WInput
        v-model="form.code"
        name="code"
        label="Department Code"
        placeholder="e.g. QA"
        hint="Unique identifier for this department."
        :loading="isChecking"
        :disable="isEdit"
      >
        <template #label> Code <span class="tw:text-bad">*</span> </template>
        <template #append>
          <WIcon
            v-if="!isChecking && isAvailable === true"
            name="check_circle"
            color="positive"
            size="xs"
          />
          <WIcon
            v-if="!isChecking && isAvailable === false"
            name="cancel"
            color="negative"
            size="xs"
          />
        </template>
      </WInput>

      <DocumentsSiteSelect v-model:siteId="form.siteId" name="siteId" required :multiple="false">
        <template #label> Site <span class="tw:text-bad">*</span> </template>
      </DocumentsSiteSelect>

      <WInput
        v-model="form.description"
        label="Description"
        placeholder="e.g. Quality assurance and testing department"
        type="textarea"
        autogrow
      />

      <WInput
        v-model.number="form.displayOrder"
        label="Display Order"
        placeholder="1000"
        type="number"
        hint="Lower numbers appear first in lists"
      />
    </div>

    <template #actions>
      <WBtn flat label="Cancel" color="primary" @click="open = false" />
      <WBtn
        :label="isEdit ? 'Update Department' : 'Create Department'"
        color="primary"
        unelevated
        :loading="isSubmitting"
        :disable="isSubmitting"
        @click="onSubmit"
      />
    </template>
  </WDialog>
</template>

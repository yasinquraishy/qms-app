<script setup>
import { IconCheck, IconX as IconXCross } from '@tabler/icons-vue'
import { required, helpers } from '@vuelidate/validators'
import { useValidator } from '@shared/composables/validator.js'

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

// Load existing department if editing
const department = useLiveQueryWithDeps([() => props.id], async (db, [id]) => {
  if (!id) return null
  return db.Department.findByPk(id)
})

// Code availability check using live query
const codeAvailable = useLiveQueryWithDeps(
  [() => props.id, () => form.value.code],
  async (db, [id, code]) => {
    if (!code || code.trim().length < 2) return true
    const all = await db.Department.where().exec()
    return !all.some((d) => d.code === code && d.id !== id)
  },
  { initial: true },
)

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

const isSubmitting = ref(false)
const isEdit = computed(() => !!props.id)

// Populate form when department loads in edit mode
watch(
  department,
  (d) => {
    if (d) {
      form.value = {
        name: d.name,
        code: d.code,
        siteId: d.siteId,
        description: d.description || '',
        displayOrder: d.displayOrder || 1000,
      }
    }
  },
  { immediate: true },
)

// Reset form when dialog closes
watch(open, (val) => {
  if (!val) {
    form.value = { name: '', code: '', siteId: null, description: '', displayOrder: 1000 }
  }
})

// Auto-suggest code when name changes (create mode only)
const getCodeSuggestion = useLiveMutation(async (db, suggested) => {
  const all = await db.Department.where().exec()
  let code = suggested
  let counter = 1
  while (all.some((d) => d.code === code)) {
    code = `${suggested}-${counter}`
    counter++
  }
  return code
})

async function onNameBlur() {
  if (!form.value.name || form.value.code || isEdit.value) return

  const suggested = form.value.name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 10)

  form.value.code = await getCodeSuggestion(suggested)
}

const createDepartment = useLiveMutation(async (db, data) => {
  const d = db.Department.create(data)
  await d.save()
  return d
})

async function onSubmit() {
  const valid = await validator.value.$validate()
  if (!valid || !codeAvailable.value) return

  isSubmitting.value = true
  try {
    if (!isEdit.value) {
      const newDept = await createDepartment({
        name: form.value.name,
        code: form.value.code,
        siteId: form.value.siteId,
        description: form.value.description,
        displayOrder: form.value.displayOrder || 1000,
      })
      emit('created', newDept)
    } else {
      department.value.name = form.value.name
      department.value.siteId = form.value.siteId
      department.value.description = form.value.description
      department.value.displayOrder = form.value.displayOrder || 1000
      await department.value.save()
      emit('updated', department.value)
    }
    open.value = false
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <BaseDialog
    v-model="open"
    :title="isEdit ? 'Edit Department' : 'Create New Department'"
    maxWidth="md"
  >
    <div class="tw:flex tw:flex-col tw:gap-4">
      <BaseTextInput
        v-model="form.name"
        name="name"
        label="Department Name"
        placeholder="e.g. Quality Assurance"
        :required="true"
        @blur="onNameBlur"
      />

      <div class="tw:relative">
        <BaseTextInput
          v-model="form.code"
          name="code"
          label="Code"
          placeholder="e.g. QA"
          :required="true"
          :disabled="isEdit"
          :errorMsg="!codeAvailable ? 'Code already in use' : ''"
        />
        <template v-if="!isEdit && form.code">
          <IconCheck
            v-if="codeAvailable"
            class="tw:absolute tw:right-3 tw:top-9 tw:size-4 tw:text-green"
          />
          <IconXCross v-else class="tw:absolute tw:right-3 tw:top-9 tw:size-4 tw:text-red" />
        </template>
      </div>

      <DocumentsSiteSelect v-model:siteId="form.siteId" name="siteId" :required="true" />

      <BaseTextarea
        v-model="form.description"
        label="Description"
        placeholder="e.g. Quality assurance and testing department"
        :rows="2"
      />

      <BaseTextInput
        v-model.number="form.displayOrder"
        name="displayOrder"
        label="Display Order"
        placeholder="1000"
        type="number"
      />
    </div>

    <template #footer>
      <BaseButton variant="outline" @click="open = false"> Cancel </BaseButton>
      <BaseButton :disabled="isSubmitting" @click="onSubmit">
        {{ isEdit ? 'Update Department' : 'Create Department' }}
      </BaseButton>
    </template>
  </BaseDialog>
</template>

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

// Load existing site if editing
const site = useLiveQueryWithDeps([() => props.id], async (db, [id]) => {
  if (!id) return null
  return db.Site.findByPk(id)
})

// Code availability check using live query
const codeAvailable = useLiveQueryWithDeps(
  [() => props.id, () => form.value.code],
  async (db, [id, code]) => {
    if (!code || code.trim().length < 2) return true
    const all = await db.Site.where().exec()
    return !all.some((s) => s.code === code && s.id !== id)
  },
  { initial: true },
)

const form = ref({
  name: '',
  code: '',
  address: '',
  timezone: 'UTC',
})

const rules = computed(() => ({
  name: { required: helpers.withMessage('Required', required) },
  code: { required: helpers.withMessage('Required', required) },
}))

const validator = useValidator(rules, form)

const isSubmitting = ref(false)
const isEdit = computed(() => !!props.id)

// Populate form when site loads in edit mode
watch(
  site,
  (s) => {
    if (s) {
      form.value = {
        name: s.name,
        code: s.code,
        address: s.address,
        timezone: s.timezone || 'UTC',
      }
    }
  },
  { immediate: true },
)

const getCodeSuggestion = useLiveMutation(async (db, suggested) => {
  const all = await db.Site.where().exec()

  // Ensure uniqueness
  let code = suggested
  let counter = 1
  while (all.some((s) => s.code === code)) {
    code = `${suggested}-${counter}`
    counter++
  }

  return code
})

// Auto-suggest code when name changes (create mode only)
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

const createSite = useLiveMutation(async (db, newSite) => {
  const created = db.Site.create(newSite)
  await created.save()
  return created
})

async function onSubmit() {
  const valid = await validator.value.$validate()
  if (!valid || !codeAvailable.value) return

  isSubmitting.value = true
  try {
    if (!isEdit.value) {
      const newSite = await createSite({
        name: form.value.name,
        code: form.value.code,
        address: form.value.address,
        timezone: form.value.timezone || 'UTC',
      })
      emit('created', newSite)
    } else {
      site.value.name = form.value.name
      site.value.address = form.value.address
      site.value.timezone = form.value.timezone || 'UTC'
      await site.value.save()
      emit('updated', site.value)
    }
    open.value = false
  } finally {
    isSubmitting.value = false
  }
}

// Reset form when dialog closes
watch(open, (val) => {
  if (!val) {
    form.value = { name: '', code: '', address: '', timezone: 'UTC' }
  }
})
</script>

<template>
  <BaseDialog v-model="open" :title="isEdit ? 'Edit Site' : 'Create New Site'" maxWidth="md">
    <div class="tw:flex tw:flex-col tw:gap-4">
      <BaseTextInput
        v-model="form.name"
        name="name"
        label="Site Name"
        placeholder="e.g. New York Headquarters"
        :required="true"
        @blur="onNameBlur"
      />

      <div class="tw:relative">
        <BaseTextInput
          v-model="form.code"
          name="code"
          label="Code"
          placeholder="e.g. NY-HQ"
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

      <BaseTextarea
        v-model="form.address"
        label="Address"
        placeholder="e.g. 123 Main St, New York, NY"
        :rows="2"
      />

      <TimezoneDropdown v-model="form.timezone" />
    </div>

    <template #footer>
      <button
        class="tw:rounded-lg tw:px-4 tw:py-2 tw:text-sm tw:font-medium tw:text-secondary tw:hover:bg-main-hover tw:transition-colors"
        @click="open = false"
      >
        Cancel
      </button>
      <button
        class="tw:rounded-lg tw:bg-primary tw:px-4 tw:py-2 tw:text-sm tw:font-medium tw:text-white tw:hover:bg-primary/90 tw:transition-colors tw:disabled:opacity-50"
        :disabled="isSubmitting"
        @click="onSubmit"
      >
        {{ isEdit ? 'Update Site' : 'Create Site' }}
      </button>
    </template>
  </BaseDialog>
</template>

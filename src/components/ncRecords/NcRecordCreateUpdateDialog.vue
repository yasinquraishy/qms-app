<script setup>
import { IconAlertTriangle } from '@tabler/icons-vue'
import { required, helpers, maxLength } from '@vuelidate/validators'
import { useValidator } from '@shared/composables/validator.js'

const props = defineProps({
  id: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['created', 'updated'])

const open = defineModel({
  type: Boolean,
  default: false,
})

const form = ref({
  title: '',
  description: '',
  ncTypeId: null,
  sourceId: null,
  severityId: null,
  siteId: null,
  departmentId: null,
  productId: null,
  detectedDate: null,
  quantityAffected: null,
  uom: '',
})

const isSubmitting = ref(false)
const isEdit = computed(() => !!props.id)

const record = useLiveQueryWithDeps([() => props.id], async (db, [id]) => {
  if (!id) return null
  return db.NcRecord.findByPk(id)
})

watch(
  record,
  (r) => {
    if (r) {
      form.value = {
        title: r.title,
        description: r.description,
        ncTypeId: r.ncTypeId,
        sourceId: r.sourceId,
        severityId: r.severityId,
        siteId: r.siteId,
        departmentId: r.departmentId,
        productId: r.productId,
        detectedDate: r.detectedDate,
        quantityAffected: r.quantityAffected,
        uom: r.uom ?? '',
      }
    }
  },
  { immediate: true },
)

const rules = computed(() => ({
  title: {
    required: helpers.withMessage('Title is required', required),
    maxLength: helpers.withMessage('Max 255 characters', maxLength(255)),
  },
  severityId: { required: helpers.withMessage('Severity is required', required) },
  ncTypeId: { required: helpers.withMessage('Type is required', required) },
  sourceId: { required: helpers.withMessage('Source is required', required) },
  departmentId: { required: helpers.withMessage('Department is required', required) },
  detectedDate: { required: helpers.withMessage('Date detected is required', required) },
}))

const validator = useValidator(rules, form)

const createRecord = useLiveMutation(async (db, data) => {
  const prefix = 'NC'

  let counter = await db.NcCounter.where('prefix', prefix).first()
  if (!counter) {
    counter = db.NcCounter.create({ prefix, currentValue: 1 })
  } else {
    counter.currentValue += 1
  }

  const ncNumber = `${prefix}-${String(counter.currentValue).padStart(4, '0')}`

  const instance = db.NcRecord.create({ ...data, ncNumber })
  await instance.save()
  await counter.save()
  return instance
})

async function onSubmit() {
  const valid = await validator.value.$validate()
  if (!valid) return

  isSubmitting.value = true
  try {
    if (!isEdit.value) {
      const created = await createRecord(form.value)
      emit('created', created)
    } else {
      Object.assign(record.value, form.value)
      await record.value.save()
      emit('updated', record.value)
    }
    open.value = false
  } finally {
    isSubmitting.value = false
  }
}

watch(open, (val) => {
  if (!val) {
    form.value = {
      title: '',
      description: '',
      ncTypeId: null,
      sourceId: null,
      severityId: null,
      siteId: null,
      departmentId: null,
      productId: null,
      detectedDate: null,
      quantityAffected: null,
      uom: '',
    }
    validator.value.$reset()
  }
})
</script>

<template>
  <BaseDialog v-model="open" maxWidth="lg">
    <template #title>
      <div class="tw:flex tw:items-center tw:gap-3">
        <div
          class="tw:w-9 tw:h-9 tw:bg-primary/10 tw:text-primary tw:rounded-xl tw:flex tw:items-center tw:justify-center"
        >
          <IconAlertTriangle class="tw:size-5 tw:text-primary" />
        </div>
        <span>{{ isEdit ? 'Edit Non-Conformance' : 'Create Non-Conformance' }}</span>
      </div>
    </template>

    <div class="tw:flex tw:flex-col tw:gap-4">
      <BaseTextInput
        v-model="form.title"
        name="title"
        label="Title"
        placeholder="Brief description of the non-conformance"
        :required="true"
        :errorMsg="validator.title?.$errors[0]?.$message"
      />

      <BaseTextarea
        v-model="form.description"
        label="Description"
        placeholder="Detailed description of the issue..."
        :rows="3"
      />

      <div class="tw:grid tw:grid-cols-2 tw:gap-4">
        <div class="tw:flex tw:flex-col tw:gap-1">
          <label class="tw:text-sm tw:font-medium tw:text-secondary"
            >Severity <span class="tw:text-red">*</span></label
          >
          <NcSeveritySelectMenu v-model="form.severityId" :required="true" />
          <span v-if="validator.severityId?.$errors[0]" class="tw:text-xs tw:text-red">
            {{ validator.severityId.$errors[0].$message }}
          </span>
        </div>

        <div class="tw:flex tw:flex-col tw:gap-1">
          <label class="tw:text-sm tw:font-medium tw:text-secondary"
            >Type <span class="tw:text-red">*</span></label
          >
          <NcTypeSelectMenu v-model="form.ncTypeId" :required="true" />
          <span v-if="validator.ncTypeId?.$errors[0]" class="tw:text-xs tw:text-red">
            {{ validator.ncTypeId.$errors[0].$message }}
          </span>
        </div>

        <div class="tw:flex tw:flex-col tw:gap-1">
          <label class="tw:text-sm tw:font-medium tw:text-secondary"
            >Source <span class="tw:text-red">*</span></label
          >
          <NcSourceSelectMenu v-model="form.sourceId" :required="true" />
          <span v-if="validator.sourceId?.$errors[0]" class="tw:text-xs tw:text-red">
            {{ validator.sourceId.$errors[0].$message }}
          </span>
        </div>

        <div class="tw:flex tw:flex-col tw:gap-1">
          <label class="tw:text-sm tw:font-medium tw:text-secondary">Site</label>
          <SiteSelectMenu v-model="form.siteId" />
        </div>

        <div class="tw:flex tw:flex-col tw:gap-1">
          <label class="tw:text-sm tw:font-medium tw:text-secondary"
            >Department <span class="tw:text-red">*</span></label
          >
          <DepartmentSelectMenu v-model="form.departmentId" :required="true" />
          <span v-if="validator.departmentId?.$errors[0]" class="tw:text-xs tw:text-red">
            {{ validator.departmentId.$errors[0].$message }}
          </span>
        </div>

        <div class="tw:flex tw:flex-col tw:gap-1">
          <label class="tw:text-sm tw:font-medium tw:text-secondary">Affected Product</label>
          <ProductSelectMenu v-model="form.productId" />
        </div>

        <div class="tw:flex tw:flex-col tw:gap-1">
          <label class="tw:text-sm tw:font-medium tw:text-secondary"
            >Date Detected <span class="tw:text-red">*</span></label
          >
          <BaseDatePicker v-model="form.detectedDate" />
          <span v-if="validator.detectedDate?.$errors[0]" class="tw:text-xs tw:text-red">
            {{ validator.detectedDate.$errors[0].$message }}
          </span>
        </div>
      </div>

      <div class="tw:grid tw:grid-cols-2 tw:gap-4">
        <BaseTextInput
          v-model.number="form.quantityAffected"
          label="Quantity Affected"
          type="number"
          placeholder="e.g. 50"
        />
        <BaseTextInput v-model="form.uom" label="Unit of Measure" placeholder="e.g. units, kg" />
      </div>
    </div>

    <template #footer>
      <button
        class="tw:rounded-lg tw:px-4 tw:py-2 tw:text-sm tw:font-medium tw:text-secondary tw:hover:bg-main-hover tw:transition-colors"
        @click="open = false"
      >
        Cancel
      </button>
      <BaseButton :loading="isSubmitting" @click="onSubmit">
        {{ isEdit ? 'Save Changes' : 'Create NC' }}
      </BaseButton>
    </template>
  </BaseDialog>
</template>

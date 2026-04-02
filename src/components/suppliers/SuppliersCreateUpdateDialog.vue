<script setup>
import { useDebounceFn } from '@vueuse/core'
import { useQuasar } from 'quasar'
import { required, helpers } from '@vuelidate/validators'
import { useValidator } from '@shared/composables/validator.js'
import { useSuppliers } from '@/composables/useSuppliers.js'

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

const { checkCodeAvailability, createSupplier, updateSupplier, suppliers } = useSuppliers()
const $q = useQuasar()

const categoryOptions = [
  { label: 'Raw Materials', value: 'Raw Materials' },
  { label: 'Component', value: 'Component' },
  { label: 'Service', value: 'Service' },
  { label: 'Software', value: 'Software' },
]

const countryOptions = [
  'United States',
  'Canada',
  'United Kingdom',
  'Germany',
  'France',
  'Japan',
  'China',
  'Australia',
  'India',
  'Brazil',
]

const riskOptions = [
  { label: 'Low', value: 'Low', description: 'Standard Commodities', color: 'positive' },
  { label: 'Medium', value: 'Medium', description: 'Specialized Components', color: 'warning' },
  { label: 'High', value: 'High', description: 'Critical Infrastructure', color: 'negative' },
]

function getDefaultForm() {
  return {
    name: '',
    code: '',
    category: null,
    streetAddress: '',
    city: '',
    stateProvince: '',
    zipPostalCode: '',
    country: null,
    riskLevel: null,
    contacts: [],
  }
}

const form = ref(getDefaultForm())

const rules = computed(() => ({
  name: { required: helpers.withMessage('Required', required) },
  code: { required: helpers.withMessage('Required', required) },
  category: { required: helpers.withMessage('Required', required) },
}))

const validator = useValidator(rules, form)

const certificateFiles = ref([])
const licenseFiles = ref([])
const certificateUploaderRef = ref(null)
const licenseUploaderRef = ref(null)

const isChecking = ref(false)
const isAvailable = ref(null)
const isSubmitting = ref(false)

const isEdit = computed(() => !!props.id)

// Load supplier data when editing
watch(
  () => props.id,
  (newId) => {
    if (newId) {
      const supplier = suppliers.value.find((s) => s.id === newId)
      if (supplier) {
        form.value = {
          name: supplier.name || '',
          code: supplier.code || '',
          category: supplier.category || null,
          streetAddress: supplier.streetAddress || '',
          city: supplier.city || '',
          stateProvince: supplier.stateProvince || '',
          zipPostalCode: supplier.zipPostalCode || '',
          country: supplier.country || null,
          riskLevel: supplier.riskLevel || null,
          contacts:
            supplier.contacts?.map((c) => ({
              email: c.email || '',
              phoneNumber: c.phoneNumber || '',
              isPrimary: c.isPrimary || false,
            })) || [],
        }

        // Populate uploaded files from existing documents
        const certs = supplier.documents?.filter((d) => d.documentType === 'certificate') || []
        const lics = supplier.documents?.filter((d) => d.documentType === 'license') || []
        certificateFiles.value = certs.map((d) => d.asset).filter(Boolean)
        licenseFiles.value = lics.map((d) => d.asset).filter(Boolean)

        isAvailable.value = true
      }
    }
  },
  { immediate: true },
)

// Reset form when dialog closes
watch(open, (val) => {
  if (!val) {
    if (!props.id) {
      form.value = getDefaultForm()
      certificateFiles.value = []
      licenseFiles.value = []
      isAvailable.value = null
    }
  }
})

// Debounced code availability check
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

// Auto-suggest code from name
async function onNameBlur() {
  if (!form.value.name || form.value.code) return

  const result = await checkCodeAvailability(null, form.value.name, true)
  if (result && result.suggestedCode) {
    form.value.code = result.suggestedCode
  }
}

// Secondary contacts management
function addContact() {
  form.value.contacts.push({ email: '', phoneNumber: '', isPrimary: false })
}

function removeContact(index) {
  form.value.contacts.splice(index, 1)
}

const isValid = asyncComputed(async () => {
  const valid = await validator.value.$validate()
  return valid && isAvailable.value !== false
}, false)

async function onSubmit() {
  if (!isValid.value) return

  // Upload any pending files before submitting
  if (certificateUploaderRef.value) {
    await certificateUploaderRef.value.uploadAllFiles()
  }
  if (licenseUploaderRef.value) {
    await licenseUploaderRef.value.uploadAllFiles()
  }

  isSubmitting.value = true

  // Build documents array from uploaded files
  const documents = [
    ...certificateFiles.value.map((asset) => ({
      assetId: asset.id,
      documentType: 'certificate',
    })),
    ...licenseFiles.value.map((asset) => ({
      assetId: asset.id,
      documentType: 'license',
    })),
  ]

  // Build contacts array (filter out empty entries)
  const contacts = form.value.contacts.filter((c) => c.email?.trim() || c.phoneNumber?.trim())

  const payload = {
    name: form.value.name.trim(),
    category: form.value.category,
    streetAddress: form.value.streetAddress?.trim() || null,
    city: form.value.city?.trim() || null,
    stateProvince: form.value.stateProvince?.trim() || null,
    zipPostalCode: form.value.zipPostalCode?.trim() || null,
    country: form.value.country || null,
    riskLevel: form.value.riskLevel || null,
    contacts: contacts.length > 0 ? contacts : undefined,
    documents: documents.length > 0 ? documents : undefined,
  }

  let result
  if (isEdit.value) {
    result = await updateSupplier(props.id, payload)
  } else {
    result = await createSupplier({
      ...payload,
      code: form.value.code.trim(),
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
      message: isEdit.value ? 'Supplier updated successfully' : 'Supplier created successfully',
    })
    if (isEdit.value) {
      emit('updated', result.supplier)
    } else {
      emit('created', result.supplier)
    }
    open.value = false
  }
}
</script>

<template>
  <WDialog v-model="open" :title="isEdit ? 'Edit Supplier' : 'New Supplier Onboarding'" maximized>
    <div class="tw:flex tw:flex-col tw:gap-6 tw:max-w-5xl tw:mx-auto tw:w-full">
      <!-- Basic Information -->
      <div class="tw:bg-sidebar tw:rounded-xl tw:border tw:border-divider tw:p-6">
        <div class="tw:flex tw:items-center tw:gap-3 tw:mb-5">
          <WIcon name="info" class="tw:text-primary" size="24px" />
          <h3 class="tw:text-base tw:font-bold tw:text-on-sidebar">Basic Information</h3>
        </div>

        <div class="tw:grid tw:grid-cols-1 tw:md:grid-cols-2 tw:gap-4">
          <WInput
            v-model="form.name"
            name="name"
            placeholder="e.g. Global Logistics Corp"
            @blur="onNameBlur"
          >
            <template #label> Supplier Name <span class="tw:text-bad">*</span> </template>
          </WInput>

          <WInput
            v-model="form.code"
            name="code"
            placeholder="e.g. SUP-2024-001"
            hint="Unique identifier for this supplier."
            :loading="isChecking"
            :disable="isEdit"
          >
            <template #label> Supplier Code <span class="tw:text-bad">*</span> </template>
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

          <WSelect
            v-model="form.category"
            name="category"
            :options="categoryOptions"
            emitValue
            mapOptions
          >
            <template #label> Category <span class="tw:text-bad">*</span> </template>
          </WSelect>
        </div>
      </div>

      <!-- Contact Details -->
      <div class="tw:bg-sidebar tw:rounded-xl tw:border tw:border-divider tw:p-6">
        <div class="tw:flex tw:items-center tw:gap-3 tw:mb-5">
          <WIcon name="contact_page" class="tw:text-primary" size="24px" />
          <h3 class="tw:text-base tw:font-bold tw:text-on-sidebar">Contact Details</h3>
        </div>

        <!-- Contacts -->
        <div v-if="form.contacts.length > 0" class="tw:space-y-3">
          <div class="tw:text-xs tw:font-bold tw:uppercase tw:text-secondary tw:tracking-wide">
            Contacts
          </div>
          <div
            v-for="(contact, index) in form.contacts"
            :key="index"
            class="tw:grid tw:grid-cols-1 tw:md:grid-cols-[1fr_1fr_auto_auto] tw:gap-3 tw:items-start"
          >
            <WInput v-model="contact.email" placeholder="email@supplier.com" type="email" dense>
              <template #label>Email</template>
            </WInput>
            <WInput v-model="contact.phoneNumber" placeholder="+1 (555) 000-0000" dense>
              <template #label>Phone</template>
            </WInput>
            <QToggle v-model="contact.isPrimary" label="Primary" dense class="tw:mt-5" />
            <WBtn
              flat
              round
              dense
              icon="close"
              color="negative"
              class="tw:mt-5"
              @click="removeContact(index)"
            />
          </div>
        </div>

        <WBtn
          flat
          dense
          icon="add"
          label="Add Contact"
          color="primary"
          class="tw:mt-4"
          @click="addContact"
        />
      </div>

      <!-- Registered Address -->
      <div class="tw:bg-sidebar tw:rounded-xl tw:border tw:border-divider tw:p-6">
        <div class="tw:flex tw:items-center tw:gap-3 tw:mb-5">
          <WIcon name="location_on" class="tw:text-primary" size="24px" />
          <h3 class="tw:text-base tw:font-bold tw:text-on-sidebar">Registered Address</h3>
        </div>

        <div class="tw:grid tw:grid-cols-1 tw:md:grid-cols-3 tw:gap-4">
          <div class="tw:md:col-span-2">
            <WInput v-model="form.streetAddress" placeholder="123 Industrial Parkway">
              <template #label>Street Address</template>
            </WInput>
          </div>

          <WInput v-model="form.city" placeholder="New York">
            <template #label>City</template>
          </WInput>

          <WInput v-model="form.stateProvince" placeholder="NY">
            <template #label>State/Province</template>
          </WInput>

          <WInput v-model="form.zipPostalCode" placeholder="10001">
            <template #label>Zip/Postal Code</template>
          </WInput>

          <WSelect v-model="form.country" :options="countryOptions" clearable>
            <template #label>Country</template>
          </WSelect>
        </div>
      </div>

      <!-- Risk Assessment & Compliance Documents -->
      <div class="tw:grid tw:grid-cols-1 tw:lg:grid-cols-3 tw:gap-6">
        <!-- Risk Assessment -->
        <div class="tw:bg-sidebar tw:rounded-xl tw:border tw:border-divider tw:p-6">
          <div class="tw:flex tw:items-center tw:gap-3 tw:mb-5">
            <WIcon name="shield" class="tw:text-primary" size="24px" />
            <h3 class="tw:text-base tw:font-bold tw:text-on-sidebar">Risk Assessment</h3>
          </div>

          <div
            class="tw:text-xs tw:font-bold tw:uppercase tw:text-secondary tw:tracking-wide tw:mb-3"
          >
            Self-Declared Risk Level
          </div>
          <div class="tw:flex tw:flex-col tw:gap-3">
            <label
              v-for="option in riskOptions"
              :key="option.value"
              class="tw:flex tw:items-center tw:gap-3 tw:p-4 tw:rounded-lg tw:border tw:border-divider tw:cursor-pointer tw:transition-colors"
              :class="
                form.riskLevel === option.value
                  ? 'tw:bg-primary/5 tw:border-primary'
                  : 'tw:hover:bg-main-hover'
              "
            >
              <input
                v-model="form.riskLevel"
                type="radio"
                :value="option.value"
                class="tw:accent-primary"
              />
              <div class="tw:flex tw:flex-col">
                <span class="tw:text-sm tw:font-bold tw:text-on-sidebar">{{ option.label }}</span>
                <span
                  class="tw:text-[10px] tw:text-secondary tw:uppercase tw:font-bold tw:tracking-tight"
                >
                  {{ option.description }}
                </span>
              </div>
            </label>
          </div>
        </div>

        <!-- Compliance Documents -->
        <div
          class="tw:lg:col-span-2 tw:bg-sidebar tw:rounded-xl tw:border tw:border-divider tw:p-6"
        >
          <div class="tw:flex tw:items-center tw:gap-3 tw:mb-5">
            <WIcon name="verified_user" class="tw:text-primary" size="24px" />
            <h3 class="tw:text-base tw:font-bold tw:text-on-sidebar">Compliance Documents</h3>
          </div>

          <div class="tw:space-y-4">
            <WUploader
              ref="certificateUploaderRef"
              v-model="certificateFiles"
              label="Certificates"
              accept="application/pdf,image/*"
              fileType="ASSET"
            />

            <WUploader
              ref="licenseUploaderRef"
              v-model="licenseFiles"
              label="Licenses"
              accept="application/pdf,image/*"
              fileType="ASSET"
            />
          </div>
        </div>
      </div>
    </div>

    <template #actions>
      <WBtn flat label="Cancel" color="primary" @click="open = false" />
      <WBtn
        :label="isEdit ? 'Update Supplier' : 'Submit for Onboarding'"
        color="primary"
        unelevated
        :loading="isSubmitting"
        :disable="!isValid"
        @click="onSubmit"
      />
    </template>
  </WDialog>
</template>

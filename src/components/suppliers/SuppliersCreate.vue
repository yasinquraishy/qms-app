<script setup>
import { useDebounceFn } from '@vueuse/core'
import { useQuasar } from 'quasar'
import { required, helpers } from '@vuelidate/validators'
import { useValidator } from '@shared/composables/validator.js'
import { useSuppliers } from '@/composables/useSuppliers.js'
import { getCompanyPath } from '@/utils/routeHelpers.js'
import { validateUUID } from '@/utils/validators.js'

const props = defineProps({
  id: {
    type: String,
    default: null,
  },
})

const router = useRouter()
const $q = useQuasar()
const { checkCodeAvailability, createSupplier, updateSupplier, suppliers, fetchSuppliers } =
  useSuppliers()

const saving = ref(false)
const loading = ref(false)
const isChecking = ref(false)
const isAvailable = ref(null)

const categoryOptions = ['Raw Materials', 'Component', 'Service', 'Software']

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
    contacts: [{ email: '', phoneNumber: '', isPrimary: true }],
    siteIds: [],
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

const isEditMode = computed(() => validateUUID(props.id))
const pageTitle = computed(() => (isEditMode.value ? 'Edit Supplier' : 'New Supplier Onboarding'))

// Load supplier data when editing
onMounted(async () => {
  if (isEditMode.value) {
    loading.value = true
    await fetchSuppliers()
    loading.value = false

    const supplier = suppliers.value.find((s) => s.id === props.id)
    if (!supplier) {
      $q.notify({ type: 'negative', message: 'Supplier not found' })
      goBack()
      return
    }

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
      siteIds: supplier.sites?.map((s) => s.id) || [],
    }

    const certs = supplier.documents?.filter((d) => d.documentType === 'certificate') || []
    const lics = supplier.documents?.filter((d) => d.documentType === 'license') || []
    certificateFiles.value = certs.map((d) => d.asset).filter(Boolean)
    licenseFiles.value = lics.map((d) => d.asset).filter(Boolean)

    isAvailable.value = true
  }
})

// Debounced code availability check
const checkAvailabilityDebounced = useDebounceFn(async (newCode) => {
  if (!newCode || newCode.trim().length < 2) return

  isChecking.value = true
  const result = await checkCodeAvailability(newCode.trim(), '', false)
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
    if (isEditMode.value) return
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

// Contacts management
function addContact() {
  form.value.contacts.push({ email: '', phoneNumber: '', isPrimary: false })
}

function removeContact(index) {
  const contact = form.value.contacts[index]
  form.value.contacts.splice(index, 1)

  // If removed contact was primary, assign primary to the first remaining contact
  if (contact.isPrimary && form.value.contacts.length > 0) {
    form.value.contacts[0].isPrimary = true
  }
}

function setPrimary(index) {
  form.value.contacts.forEach((c, i) => {
    c.isPrimary = i === index
  })
}

const hasPrimaryContact = computed(() => {
  return form.value.contacts.some((c) => c.isPrimary && (c.email?.trim() || c.phoneNumber?.trim()))
})

async function saveSupplier() {
  const valid = await validator.value.$validate()
  if (!valid || isAvailable.value !== true) return

  if (!hasPrimaryContact.value) {
    $q.notify({
      type: 'negative',
      message: 'At least one primary contact with email or phone is required',
    })
    return
  }

  // Upload any pending files before submitting
  if (certificateUploaderRef.value) {
    await certificateUploaderRef.value.uploadAllFiles()
  }
  if (licenseUploaderRef.value) {
    await licenseUploaderRef.value.uploadAllFiles()
  }

  saving.value = true

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
    siteIds: form.value.siteIds,
  }

  try {
    let result
    if (isEditMode.value) {
      result = await updateSupplier(props.id, payload)
    } else {
      result = await createSupplier({
        ...payload,
        code: form.value.code.trim(),
      })
    }

    if (result.error) {
      $q.notify({ type: 'negative', message: result.error })
    } else {
      $q.notify({
        type: 'positive',
        message: isEditMode.value
          ? 'Supplier updated successfully'
          : 'Supplier created successfully',
      })
      router.push(getCompanyPath('/suppliers'))
    }
  } finally {
    saving.value = false
  }
}

function goBack() {
  router.push(getCompanyPath('/suppliers'))
}

function discardChanges() {
  $q.dialog({
    title: 'Discard Changes',
    message: 'Are you sure you want to discard all changes?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    goBack()
  })
}
</script>

<template>
  <div class="tw:flex tw:flex-col tw:h-full">
    <SafeTeleport to="#main-header-title">
      <div class="tw:flex tw:items-center tw:gap-2 tw:text-on-sidebar">
        <WIcon icon="local_shipping" class="tw:text-primary" size="24px" />
        <h2 class="tw:text-lg tw:font-bold tw:tracking-tight tw:text-nowrap">
          {{ pageTitle }}
        </h2>
      </div>
    </SafeTeleport>

    <!-- Loading overlay -->
    <div v-if="loading" class="tw:flex tw:items-center tw:justify-center tw:h-full">
      <QSpinner color="primary" size="50px" />
    </div>

    <!-- Scrollable content -->
    <div v-else class="tw:flex-1 tw:overflow-y-auto tw:pb-24">
      <div class="tw:max-w-5xl tw:mx-auto tw:px-6 tw:py-8">
        <!-- Breadcrumbs -->
        <div class="tw:mb-4 tw:flex tw:items-center tw:text-sm tw:text-secondary tw:gap-2">
          <span class="tw:cursor-pointer tw:hover:underline" @click="goBack">Suppliers</span>
          <WIcon name="chevron_right" size="16px" />
          <span class="tw:text-on-sidebar tw:font-medium">{{
            isEditMode ? 'Edit' : 'Onboarding'
          }}</span>
        </div>

        <!-- Page Header -->
        <div class="tw:mb-8">
          <h1 class="tw:text-3xl tw:font-black tw:text-on-sidebar tw:tracking-tight">
            {{ pageTitle }}
          </h1>
          <p class="tw:text-secondary tw:mt-2 tw:max-w-2xl">
            Complete the profile below to initiate the technical qualification and quality assurance
            audit for new supply partners.
          </p>
        </div>

        <!-- Form Sections -->
        <div class="tw:space-y-8">
          <!-- Row 1: Basic Information + Contact Details -->
          <div class="tw:grid tw:grid-cols-1 tw:md:grid-cols-2 tw:gap-8">
            <!-- Basic Information -->
            <WCard>
              <div
                class="tw:px-6 tw:py-4 tw:border-b tw:border-divider tw:flex tw:items-center tw:gap-2"
              >
                <WIcon name="info" class="tw:text-primary" size="22px" />
                <h2 class="tw:text-lg tw:font-bold tw:text-on-sidebar">Basic Information</h2>
              </div>
              <div class="tw:p-6 tw:flex tw:flex-col tw:gap-4">
                <WInput
                  v-model="form.name"
                  name="name"
                  label="Supplier Name"
                  placeholder="e.g. Global Logistics Corp"
                  outlined
                  dense
                  @blur="onNameBlur"
                >
                  <template #label> Supplier Name <span class="tw:text-bad">*</span> </template>
                </WInput>

                <WInput
                  v-model="form.code"
                  name="code"
                  label="Supplier Code"
                  placeholder="e.g. SUP-2024-001"
                  hint="Unique identifier for this supplier."
                  outlined
                  dense
                  :loading="isChecking"
                  :disable="isEditMode"
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
                  label="Category"
                  :options="categoryOptions"
                  emitValue
                  mapOptions
                  outlined
                  dense
                >
                  <template #label> Category <span class="tw:text-bad">*</span> </template>
                </WSelect>
              </div>
            </WCard>

            <!-- Contact Details -->
            <WCard>
              <div
                class="tw:px-6 tw:py-4 tw:border-b tw:border-divider tw:flex tw:items-center tw:gap-2"
              >
                <WIcon name="contact_page" class="tw:text-primary" size="22px" />
                <h2 class="tw:text-lg tw:font-bold tw:text-on-sidebar">Contact Details</h2>
              </div>
              <div class="tw:p-6 tw:flex tw:flex-col tw:gap-4">
                <!-- Contacts -->
                <div v-if="form.contacts.length > 0" class="tw:space-y-3">
                  <div
                    class="tw:text-xs tw:font-bold tw:uppercase tw:text-secondary tw:tracking-wide"
                  >
                    Contacts
                  </div>
                  <div
                    v-for="(contact, index) in form.contacts"
                    :key="index"
                    class="tw:flex tw:flex-col tw:gap-3 tw:items-stretch tw:p-4 tw:border tw:border-divider tw:rounded-lg"
                  >
                    <WInput
                      v-model="contact.email"
                      label="Email"
                      placeholder="email@supplier.com"
                      type="email"
                      outlined
                      dense
                    >
                      <template #label>Email</template>
                    </WInput>
                    <WInput
                      v-model="contact.phoneNumber"
                      label="Phone"
                      placeholder="+1 (555) 000-0000"
                      outlined
                      dense
                    >
                      <template #label>Phone</template>
                    </WInput>
                    <div class="tw:flex tw:items-center tw:justify-between">
                      <QToggle
                        :modelValue="contact.isPrimary"
                        label="Primary"
                        dense
                        :disable="contact.isPrimary"
                        @update:modelValue="setPrimary(index)"
                      />
                      <WBtn
                        v-if="form.contacts.length > 1"
                        flat
                        round
                        dense
                        icon="close"
                        color="negative"
                        @click="removeContact(index)"
                      />
                    </div>
                  </div>
                </div>

                <WBtn
                  flat
                  dense
                  icon="add"
                  label="Add Contact"
                  color="primary"
                  @click="addContact"
                />
              </div>
            </WCard>
          </div>

          <!-- Row 2: Registered Address (full width) -->
          <WCard>
            <div
              class="tw:px-6 tw:py-4 tw:border-b tw:border-divider tw:flex tw:items-center tw:gap-2"
            >
              <WIcon name="location_on" class="tw:text-primary" size="22px" />
              <h2 class="tw:text-lg tw:font-bold tw:text-on-sidebar">Registered Address</h2>
            </div>
            <div class="tw:p-6 tw:grid tw:grid-cols-1 tw:md:grid-cols-3 tw:gap-4">
              <div class="tw:md:col-span-2">
                <WInput
                  v-model="form.streetAddress"
                  label="Street Address"
                  placeholder="123 Industrial Parkway"
                  outlined
                  dense
                >
                  <template #label>Street Address</template>
                </WInput>
              </div>

              <WInput v-model="form.city" label="City" placeholder="New York" outlined dense>
                <template #label>City</template>
              </WInput>

              <WInput
                v-model="form.stateProvince"
                label="State/Province"
                placeholder="NY"
                outlined
                dense
              >
                <template #label>State/Province</template>
              </WInput>

              <WInput
                v-model="form.zipPostalCode"
                label="Zip/Postal Code"
                placeholder="10001"
                outlined
                dense
              >
                <template #label>Zip/Postal Code</template>
              </WInput>

              <WSelect
                v-model="form.country"
                label="Country"
                :options="countryOptions"
                clearable
                outlined
                dense
              >
                <template #label>Country</template>
              </WSelect>
            </div>
          </WCard>

          <!-- Site Assignment -->
          <WCard>
            <div
              class="tw:px-6 tw:py-4 tw:border-b tw:border-divider tw:flex tw:items-center tw:gap-2"
            >
              <WIcon name="location_on" class="tw:text-primary" size="22px" />
              <h2 class="tw:text-lg tw:font-bold tw:text-on-sidebar">Site Assignment</h2>
            </div>
            <div class="tw:p-6">
              <FormTemplatesSiteSelect
                v-model:siteId="form.siteIds"
                :required="true"
                :multiple="true"
                label="Assigned Sites"
              />
            </div>
          </WCard>

          <!-- Row 3: Risk Assessment + Compliance Documents -->
          <div class="tw:grid tw:grid-cols-1 tw:lg:grid-cols-3 tw:gap-8">
            <!-- Risk Assessment -->
            <WCard>
              <div
                class="tw:px-6 tw:py-4 tw:border-b tw:border-divider tw:flex tw:items-center tw:gap-2"
              >
                <WIcon name="shield" class="tw:text-primary" size="22px" />
                <h2 class="tw:text-lg tw:font-bold tw:text-on-sidebar">Risk Assessment</h2>
              </div>
              <div class="tw:p-6">
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
                      <span class="tw:text-sm tw:font-bold tw:text-on-sidebar">{{
                        option.label
                      }}</span>
                      <span
                        class="tw:text-[10px] tw:text-secondary tw:uppercase tw:font-bold tw:tracking-tight"
                      >
                        {{ option.description }}
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </WCard>

            <!-- Compliance Documents -->
            <WCard class="tw:lg:col-span-2">
              <div
                class="tw:px-6 tw:py-4 tw:border-b tw:border-divider tw:flex tw:items-center tw:gap-2"
              >
                <WIcon name="verified_user" class="tw:text-primary" size="22px" />
                <h2 class="tw:text-lg tw:font-bold tw:text-on-sidebar">Compliance Documents</h2>
              </div>
              <div class="tw:p-6 tw:space-y-4">
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
            </WCard>
          </div>
        </div>
      </div>
    </div>

    <!-- Sticky Footer Action Bar -->
    <div
      class="tw:relative tw:bottom-0 tw:right-0 tw:w-full tw:lg:w-[calc(100%-16rem)] tw:bg-main/80 tw:backdrop-blur-md tw:border-t tw:border-divider tw:px-6 tw:py-4 tw:z-50"
    >
      <div class="tw:max-w-5xl tw:mx-auto tw:flex tw:items-center tw:justify-between">
        <div class="tw:flex tw:items-center tw:gap-2 tw:text-sm tw:text-secondary">
          <span class="tw:w-2 tw:h-2 tw:rounded-full tw:bg-warning tw:animate-pulse" />
          Unsaved changes
        </div>
        <div class="tw:flex tw:items-center tw:gap-4">
          <WBtn
            flat
            label="Discard Changes"
            color="secondary"
            :disable="saving"
            @click="discardChanges"
          />
          <WBtn
            :label="isEditMode ? 'Save Changes' : 'Submit for Onboarding'"
            color="primary"
            icon="save"
            :loading="saving"
            :disable="saving"
            @click="saveSupplier"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { IconAlertCircle } from '@tabler/icons-vue'
import { currentSession } from '@/utils/currentSession.js'
import { getCompanyPath } from '@/utils/routeHelpers.js'

const router = useRouter()
const saving = ref(false)
const error = ref(null)

const form = ref({
  title: '',
  description: '',
  siteId: null,
  departmentId: null,
  typeId: null,
  sourceId: null,
  severityId: null,
  detectedAt: '',
  ownerId: null,
  productId: null,
  supplierId: null,
  qtyAffected: null,
  unitOfMeasure: '',
})

const createNc = useLiveMutation(async (db, data) => {
  const userId = currentSession.value?.userId || ''
  const nc = db.Nonconformance.create({
    ...data,
    statusId: 'DRAFT',
    createdBy: userId,
    updatedBy: userId,
  })
  await nc.save()
  return nc
})

async function handleSubmit() {
  error.value = null
  if (!form.value.title) {
    error.value = 'Title is required'
    return
  }
  if (!form.value.severityId) {
    error.value = 'Severity is required'
    return
  }
  if (!form.value.typeId) {
    error.value = 'NC Type is required'
    return
  }
  if (!form.value.sourceId) {
    error.value = 'Detection source is required'
    return
  }
  if (!form.value.siteId) {
    error.value = 'Site is required'
    return
  }
  if (!form.value.departmentId) {
    error.value = 'Department is required'
    return
  }
  if (!form.value.ownerId) {
    error.value = 'Owner is required'
    return
  }
  if (!form.value.detectedAt) {
    error.value = 'Detected date is required'
    return
  }

  saving.value = true
  try {
    const nc = await createNc(form.value)
    router.push(getCompanyPath(`/nonconformances/${nc.id}`))
  } catch (e) {
    error.value = e.message || 'Failed to create NC'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="tw:flex tw:flex-col tw:h-full">
    <SafeTeleport to="#main-header-title">
      <BaseBreadcrumbs
        :items="[
          { label: 'Nonconformances', to: getCompanyPath('/nonconformances') },
          { label: 'Raise NC' },
        ]"
      />
    </SafeTeleport>

    <SafeTeleport to="#main-header-actions">
      <BaseButton variant="primary" :disabled="saving" @click="handleSubmit">Submit</BaseButton>
    </SafeTeleport>

    <div class="tw:overflow-y-auto tw:flex-1">
      <div class="tw:max-w-3xl tw:mx-auto tw:p-6 tw:flex tw:flex-col tw:gap-4">
        <!-- Error -->
        <div
          v-if="error"
          class="tw:flex tw:items-center tw:gap-2 tw:bg-red-50 tw:border tw:border-red-200 tw:text-red-700 tw:rounded-lg tw:p-3 tw:text-sm"
        >
          <IconAlertCircle :size="16" />
          {{ error }}
        </div>

        <!-- Basic information -->
        <div class="tw:bg-white tw:border tw:border-divider tw:rounded-lg tw:p-5">
          <div
            class="tw:text-xs tw:font-semibold tw:text-secondary tw:uppercase tw:tracking-wider tw:pb-3 tw:border-b tw:border-divider tw:mb-4"
          >
            Basic information
          </div>
          <div class="tw:flex tw:flex-col tw:gap-3">
            <div class="tw:flex tw:flex-col tw:gap-1">
              <label class="tw:text-sm tw:font-medium tw:text-secondary">
                Title <span class="tw:text-red-500">*</span>
              </label>
              <BaseTextInput v-model="form.title" placeholder="Describe the nonconformance…" />
            </div>
            <div class="tw:flex tw:flex-col tw:gap-1">
              <label class="tw:text-sm tw:font-medium tw:text-secondary">Description</label>
              <BaseTextarea
                v-model="form.description"
                placeholder="Provide details about the nonconformance…"
                :rows="4"
              />
            </div>
          </div>
        </div>

        <!-- Classification -->
        <div class="tw:bg-white tw:border tw:border-divider tw:rounded-lg tw:p-5">
          <div
            class="tw:text-xs tw:font-semibold tw:text-secondary tw:uppercase tw:tracking-wider tw:pb-3 tw:border-b tw:border-divider tw:mb-4"
          >
            Classification
          </div>
          <div class="tw:grid tw:grid-cols-2 tw:gap-3">
            <div class="tw:flex tw:flex-col tw:gap-1">
              <label class="tw:text-sm tw:font-medium tw:text-secondary">
                Site <span class="tw:text-red-500">*</span>
              </label>
              <SiteSelectMenu v-model="form.siteId" required />
            </div>
            <div class="tw:flex tw:flex-col tw:gap-1">
              <label class="tw:text-sm tw:font-medium tw:text-secondary">
                Department <span class="tw:text-red-500">*</span>
              </label>
              <DepartmentSelectMenu v-model="form.departmentId" :siteId="form.siteId" required />
            </div>
            <div class="tw:flex tw:flex-col tw:gap-1">
              <label class="tw:text-sm tw:font-medium tw:text-secondary">
                NC Type <span class="tw:text-red-500">*</span>
              </label>
              <NcTypeSelectMenu v-model="form.typeId" required />
            </div>
            <div class="tw:flex tw:flex-col tw:gap-1">
              <label class="tw:text-sm tw:font-medium tw:text-secondary">
                Detection source <span class="tw:text-red-500">*</span>
              </label>
              <NcSourceSelectMenu v-model="form.sourceId" required />
            </div>
            <div class="tw:flex tw:flex-col tw:gap-1">
              <label class="tw:text-sm tw:font-medium tw:text-secondary">
                Severity <span class="tw:text-red-500">*</span>
              </label>
              <div class="tw:flex tw:gap-2">
                <BaseButton
                  v-for="sev in ['MINOR', 'MAJOR', 'CRITICAL']"
                  :key="sev"
                  class="tw:flex-1 tw:justify-center"
                  :variant="form.severityId === sev ? 'primary' : 'outline'"
                  @click="form.severityId = sev"
                >
                  {{ sev.charAt(0) + sev.slice(1).toLowerCase() }}
                </BaseButton>
              </div>
            </div>
            <div class="tw:flex tw:flex-col tw:gap-1">
              <label class="tw:text-sm tw:font-medium tw:text-secondary">
                Detected date <span class="tw:text-red-500">*</span>
              </label>
              <BaseDatePicker v-model="form.detectedAt" />
            </div>
            <div class="tw:flex tw:flex-col tw:gap-1 tw:col-span-2 tw:md:col-span-1">
              <label class="tw:text-sm tw:font-medium tw:text-secondary">
                Owner <span class="tw:text-red-500">*</span>
              </label>
              <UserSelectMenu v-model="form.ownerId" required />
            </div>
          </div>
        </div>

        <!-- Product & material -->
        <div class="tw:bg-white tw:border tw:border-divider tw:rounded-lg tw:p-5">
          <div
            class="tw:text-xs tw:font-semibold tw:text-secondary tw:uppercase tw:tracking-wider tw:pb-3 tw:border-b tw:border-divider tw:mb-4"
          >
            Product & material
            <span class="tw:normal-case tw:font-normal tw:text-secondary tw:ml-1">(optional)</span>
          </div>
          <div class="tw:grid tw:grid-cols-2 tw:gap-3">
            <div class="tw:flex tw:flex-col tw:gap-1">
              <label class="tw:text-sm tw:font-medium tw:text-secondary">Product</label>
              <ProductSelectMenu v-model="form.productId" :required="false" />
            </div>
            <div class="tw:flex tw:flex-col tw:gap-1">
              <label class="tw:text-sm tw:font-medium tw:text-secondary">Supplier</label>
              <SupplierSelectMenu v-model="form.supplierId" :required="false" />
            </div>
            <div class="tw:flex tw:flex-col tw:gap-1">
              <label class="tw:text-sm tw:font-medium tw:text-secondary">Qty affected</label>
              <BaseTextInput v-model="form.qtyAffected" type="number" placeholder="0" />
            </div>
            <div class="tw:flex tw:flex-col tw:gap-1">
              <label class="tw:text-sm tw:font-medium tw:text-secondary">Unit of measure</label>
              <BaseTextInput v-model="form.unitOfMeasure" placeholder="e.g. sheets, units…" />
            </div>
          </div>
        </div>

        <!-- Immediate containment action -->
        <div class="tw:bg-white tw:border tw:border-divider tw:rounded-lg tw:p-5">
          <div
            class="tw:text-xs tw:font-semibold tw:text-secondary tw:uppercase tw:tracking-wider tw:pb-3 tw:border-b tw:border-divider tw:mb-4"
          >
            Immediate containment action
            <span class="tw:normal-case tw:font-normal tw:text-secondary tw:ml-1">(optional)</span>
          </div>
          <BaseTextarea
            v-model="form.immediateContainmentAction"
            placeholder="Describe actions taken at the time of detection…"
            :rows="3"
          />
        </div>
      </div>
    </div>
  </div>
</template>

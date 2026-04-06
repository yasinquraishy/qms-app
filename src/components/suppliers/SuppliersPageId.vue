<script setup>
import { useQuasar } from 'quasar'
import { getCompanyPath } from '@/utils/routeHelpers.js'
import { isAllowed } from '@/utils/currentSession.js'
import { useSuppliers } from '@/composables/useSuppliers.js'

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const router = useRouter()
const $q = useQuasar()
const { getSupplier } = useSuppliers()

const loading = ref(false)
const supplier = ref(null)
const activeTab = ref('overview')

const breadcrumbs = computed(() => [
  { label: 'Suppliers', to: getCompanyPath('/suppliers') },
  { label: supplier.value?.name || 'Loading...' },
])

const canUpdate = computed(() => isAllowed(['suppliers:update']))

const tabs = [
  { value: 'overview', label: 'Overview' },
  { value: 'documents', label: 'Documents' },
  { value: 'linked-documents', label: 'Linked Documents' },
  { value: 'asset-requests', label: 'Asset Requests' },
  { value: 'evaluations', label: 'Evaluations' },
  { value: 'audit-logs', label: 'Audit Logs' },
]

const documentCount = computed(() => supplier.value?.documents?.length || 0)
const linkedDocumentCount = computed(() => supplier.value?.linkedDocuments?.length || 0)

async function loadSupplier() {
  loading.value = true
  const result = await getSupplier(props.id)
  loading.value = false

  if (result.error) {
    $q.notify({ type: 'negative', message: result.error })
    return
  }

  supplier.value = result.supplier
}

function onEditClick() {
  router.push(getCompanyPath(`/suppliers/${props.id}`) + '?mode=edit')
}

onMounted(() => {
  loadSupplier()
})

watch(
  () => props.id,
  () => {
    loadSupplier()
  },
)
</script>

<template>
  <div class="tw:flex tw:flex-col tw:h-full">
    <SafeTeleport to="#main-header-title">
      <WBreadcrumbs :items="breadcrumbs" />
    </SafeTeleport>

    <SafeTeleport to="#main-header-actions">
      <div class="tw:flex tw:gap-2">
        <WBtn
          v-if="canUpdate"
          label="Edit Profile"
          icon="edit"
          color="primary"
          unelevated
          class="tw:px-6 tw:font-bold"
          @click="onEditClick"
        />
      </div>
    </SafeTeleport>

    <!-- Loading State -->
    <div v-if="loading" class="tw:flex tw:flex-col tw:items-center tw:justify-center tw:py-16">
      <QSpinner color="primary" size="48px" />
      <div class="tw:text-sm tw:text-secondary tw:mt-3">Loading supplier...</div>
    </div>

    <!-- Content -->
    <div v-else-if="supplier" class="tw:overflow-y-auto">
      <div class="tw:max-w-5xl tw:mx-auto tw:p-8 tw:space-y-8">
        <!-- Header Section -->
        <section
          class="tw:flex tw:flex-col tw:md:flex-row tw:md:items-center tw:justify-between tw:gap-4"
        >
          <div class="tw:space-y-1">
            <div class="tw:flex tw:items-center tw:gap-3">
              <h1 class="tw:text-2xl tw:font-bold tw:text-on-main tw:tracking-tight">
                {{ supplier.name }}
              </h1>
              <WStatusBadge v-if="supplier.statusId" :status="supplier.statusId" showDot />
            </div>
            <p class="tw:text-secondary tw:text-sm">{{ supplier.code }} • Supplier Record</p>
          </div>
        </section>

        <!-- Tab Navigation -->
        <div class="tw:flex tw:gap-8 tw:border-b tw:border-divider tw:overflow-x-auto">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            class="tw:pb-3 tw:text-sm tw:font-medium tw:whitespace-nowrap tw:flex tw:items-center tw:gap-2 tw:transition-colors"
            :class="
              activeTab === tab.value
                ? 'tw:text-primary tw:border-b-2 tw:border-primary tw:font-bold'
                : 'tw:text-secondary tw:hover:text-on-main'
            "
            @click="activeTab = tab.value"
          >
            {{ tab.label }}
            <span
              v-if="tab.value === 'documents' && documentCount > 0"
              class="tw:bg-gray-100 tw:text-secondary tw:px-2 tw:py-0.5 tw:rounded-full tw:text-[10px] tw:font-bold"
            >
              {{ documentCount }}
            </span>
            <span
              v-if="tab.value === 'linked-documents' && linkedDocumentCount > 0"
              class="tw:bg-gray-100 tw:text-secondary tw:px-2 tw:py-0.5 tw:rounded-full tw:text-[10px] tw:font-bold"
            >
              {{ linkedDocumentCount }}
            </span>
          </button>
        </div>

        <!-- Tab Content -->
        <SuppliersOverview v-if="activeTab === 'overview'" :supplier="supplier" />
        <SuppliersDocumentsTab v-else-if="activeTab === 'documents'" :supplier="supplier" />
        <SuppliersLinkedDocumentsTab
          v-else-if="activeTab === 'linked-documents'"
          :supplier="supplier"
          @refresh="loadSupplier"
        />
        <SuppliersAssetRequestsTab
          v-else-if="activeTab === 'asset-requests'"
          :supplier="supplier"
        />
        <SuppliersEvaluationsTab v-else-if="activeTab === 'evaluations'" :supplier="supplier" />
        <SuppliersAuditLogsTab v-else-if="activeTab === 'audit-logs'" :supplier="supplier" />
      </div>
    </div>
  </div>
</template>

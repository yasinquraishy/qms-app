<script setup>
import { useQuasar } from 'quasar'
import { currentCompany } from '@/utils/currentCompany.js'
import { get, del } from '@/api'
import { isAllowed } from '@/utils/currentSession.js'

const props = defineProps({
  supplier: {
    type: Object,
    required: true,
  },
})

const $q = useQuasar()

const canUpdate = computed(() => isAllowed(['suppliers:update']))

const assetRequests = ref([])
const requestTypes = ref([])
const requestStatuses = ref([])
const loading = ref(false)

const showDialog = ref(false)
const editingRequest = ref(null)

const showSubmitDialog = ref(false)
const submittingRequest = ref(null)

async function fetchData() {
  const companyId = currentCompany.value?.id
  loading.value = true
  const [requestsData, typesData, statusesData] = await Promise.all([
    get(`/v1/services/suppliers/${props.supplier.id}/assetRequests`, {
      params: { companyId },
    }),
    get('/v1/services/assetRequestTypes'),
    get('/v1/services/assetRequestStatuses'),
  ])
  loading.value = false

  assetRequests.value = requestsData.assetRequests || []
  requestTypes.value = (typesData.assetRequestTypes || []).map((t) => ({
    label: t.name,
    value: t.id,
  }))
  requestStatuses.value = (statusesData.assetRequestStatuses || []).map((s) => ({
    label: s.name,
    value: s.id,
  }))
}

function openCreateDialog() {
  editingRequest.value = null
  showDialog.value = true
}

function openEditDialog(request) {
  editingRequest.value = request
  showDialog.value = true
}

function openSubmitDialog(request) {
  submittingRequest.value = request
  showSubmitDialog.value = true
}

function onDeleteRequest(request) {
  $q.dialog({
    title: 'Delete Asset Request',
    message: `Are you sure you want to delete "${request.title}"?`,
    cancel: true,
  }).onOk(async () => {
    const result = await del(`/v1/services/assetRequests/${request.id}`)
    if (result.error) {
      $q.notify({ type: 'negative', message: result.error })
    } else {
      $q.notify({ type: 'positive', message: 'Asset request deleted' })
      await fetchData()
    }
  })
}

function formatDate(value) {
  if (!value) return '—'
  return value?.formatDate?.('date') || value
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div
    class="tw:bg-sidebar tw:rounded-xl tw:shadow-sm tw:border tw:border-divider tw:overflow-hidden"
  >
    <!-- Header -->
    <div
      class="tw:px-6 tw:py-4 tw:border-b tw:border-divider tw:bg-main-hover tw:flex tw:items-center tw:justify-between"
    >
      <div class="tw:flex tw:items-center tw:gap-3">
        <div
          class="tw:w-10 tw:h-10 tw:rounded-lg tw:bg-gray-100 tw:flex tw:items-center tw:justify-center"
        >
          <QIcon name="request_quote" class="tw:text-secondary" size="sm" />
        </div>
        <h3 class="tw:text-lg tw:font-bold tw:text-on-main">Asset Requests</h3>
        <QBadge
          v-if="assetRequests.length"
          color="grey-5"
          textColor="grey-8"
          class="tw:rounded-full"
        >
          <span class="tw:text-[10px] tw:px-2 tw:py-0.5 tw:font-bold">
            {{ assetRequests.length }}
          </span>
        </QBadge>
      </div>
      <WBtn
        v-if="canUpdate"
        label="New Request"
        icon="add"
        color="primary"
        outline
        size="sm"
        @click="openCreateDialog"
      />
    </div>

    <!-- Loading -->
    <div v-if="loading" class="tw:flex tw:items-center tw:justify-center tw:py-12">
      <QSpinner color="primary" size="32px" />
    </div>

    <!-- List -->
    <div v-else-if="assetRequests.length" class="tw:divide-y tw:divide-divider">
      <div
        v-for="request in assetRequests"
        :key="request.id"
        class="tw:p-4 tw:flex tw:items-start tw:gap-4 tw:hover:bg-main-hover tw:transition-colors"
      >
        <div
          class="tw:w-10 tw:h-10 tw:rounded-lg tw:bg-primary/10 tw:flex tw:items-center tw:justify-center tw:shrink-0 tw:mt-0.5"
        >
          <QIcon name="assignment" color="primary" size="sm" />
        </div>

        <div class="tw:flex-1 tw:min-w-0">
          <div class="tw:flex tw:items-center tw:gap-2 tw:flex-wrap">
            <p class="tw:text-sm tw:font-medium tw:text-on-main">{{ request.title }}</p>
            <WStatusBadge v-if="request.statusId" :status="request.statusId" size="xs" />
          </div>
          <div class="tw:flex tw:items-center tw:gap-3 tw:mt-1 tw:flex-wrap">
            <span v-if="request.requestType" class="tw:text-xs tw:text-secondary">
              {{ request.requestType.name }}
            </span>
            <span v-if="request.dueDate" class="tw:text-xs tw:text-secondary">
              Due: {{ formatDate(request.dueDate) }}
            </span>
            <span v-if="request.expiryDate" class="tw:text-xs tw:text-secondary">
              Expires: {{ formatDate(request.expiryDate) }}
            </span>
          </div>
          <p v-if="request.description" class="tw:text-xs tw:text-secondary tw:mt-1 tw:truncate">
            {{ request.description }}
          </p>
          <div
            v-if="request.contacts?.length"
            class="tw:flex tw:items-center tw:gap-1 tw:mt-1 tw:flex-wrap"
          >
            <QBadge
              v-for="contact in request.contacts"
              :key="contact.id"
              color="grey-3"
              textColor="grey-8"
              class="tw:rounded-full"
            >
              <span class="tw:text-[10px] tw:px-1">{{ contact.email || contact.phoneNumber }}</span>
            </QBadge>
          </div>
        </div>

        <div v-if="canUpdate" class="tw:flex tw:items-center tw:gap-1 tw:shrink-0">
          <WBtn
            v-if="['PENDING', 'OVERDUE'].includes(request.statusId)"
            flat
            round
            dense
            icon="upload_file"
            color="positive"
            size="sm"
            title="Submit request"
            @click="openSubmitDialog(request)"
          />
          <WBtn
            flat
            round
            dense
            icon="edit"
            color="secondary"
            size="sm"
            @click="openEditDialog(request)"
          />
          <WBtn
            flat
            round
            dense
            icon="delete"
            color="negative"
            size="sm"
            @click="onDeleteRequest(request)"
          />
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else class="tw:py-12 tw:text-center">
      <QIcon name="request_quote" size="40px" class="tw:text-secondary/50 tw:mb-2" />
      <p class="tw:text-secondary tw:text-sm">No asset requests yet.</p>
      <p class="tw:text-secondary/70 tw:text-xs tw:mt-1">
        Create a request to track documents needed from this supplier.
      </p>
    </div>

    <SuppliersAssetRequestDialog
      v-model="showDialog"
      :supplierId="supplier.id"
      :editingRequest="editingRequest"
      :contacts="supplier.contacts || []"
      :requestTypes="requestTypes"
      :requestStatuses="requestStatuses"
      @saved="fetchData"
    />

    <SuppliersAssetRequestSubmitDialog
      v-model="showSubmitDialog"
      :request="submittingRequest"
      @submitted="fetchData"
    />
  </div>
</template>

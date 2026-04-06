<script setup>
import { useQuasar } from 'quasar'
import { useSuppliers } from '@/composables/useSuppliers.js'
import { currentCompany } from '@/utils/currentCompany.js'
import { get } from '@/api'
import { isAllowed } from '@/utils/currentSession.js'

const props = defineProps({
  supplier: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['refresh'])
const $q = useQuasar()
const { updateSupplier } = useSuppliers()

const canUpdate = computed(() => isAllowed(['suppliers:update']))

const linkedDocuments = computed(() => props.supplier.linkedDocuments || [])

const showAddDialog = ref(false)
const selectedDocumentVersionId = ref(null)
const availableDocuments = ref([])
const loadingDocs = ref(false)
const saving = ref(false)

async function fetchAvailableDocuments() {
  const companyId = currentCompany.value?.id
  const data = await get('/v1/services/documents', {
    params: { companyId },
    loader: loadingDocs,
  })

  const linkedVersionIds = new Set(linkedDocuments.value.map((ld) => ld.documentVersionId))
  availableDocuments.value = (data.documents || [])
    .filter((d) => d.latestVersion && !linkedVersionIds.has(d.latestVersion.id))
    .map((d) => ({
      label: `${d.docNumber} — ${d.title}`,
      value: d.latestVersion.id,
    }))
}

function openAddDialog() {
  selectedDocumentVersionId.value = null
  fetchAvailableDocuments()
  showAddDialog.value = true
}

async function onAddDocument() {
  if (!selectedDocumentVersionId.value) return

  saving.value = true
  const currentIds = linkedDocuments.value.map((ld) => ld.documentVersionId)
  const result = await updateSupplier(props.supplier.id, {
    documentVersionIds: [...currentIds, selectedDocumentVersionId.value],
  })
  saving.value = false

  if (result.error) {
    $q.notify({ type: 'negative', message: result.error })
  } else {
    $q.notify({ type: 'positive', message: 'Document linked successfully' })
    showAddDialog.value = false
    emit('refresh')
  }
}

async function onRemoveDocument(supplierDocument) {
  $q.dialog({
    title: 'Remove Link',
    message: 'Are you sure you want to unlink this document from the supplier?',
    cancel: true,
  }).onOk(async () => {
    saving.value = true
    const currentIds = linkedDocuments.value
      .map((ld) => ld.documentVersionId)
      .filter((id) => id !== supplierDocument.documentVersionId)
    const result = await updateSupplier(props.supplier.id, {
      documentVersionIds: currentIds,
    })
    saving.value = false

    if (result.error) {
      $q.notify({ type: 'negative', message: result.error })
    } else {
      $q.notify({ type: 'positive', message: 'Document unlinked' })
      emit('refresh')
    }
  })
}
</script>

<template>
  <div
    class="tw:bg-sidebar tw:rounded-xl tw:shadow-sm tw:border tw:border-divider tw:overflow-hidden"
  >
    <div
      class="tw:px-6 tw:py-4 tw:border-b tw:border-divider tw:bg-main-hover tw:flex tw:items-center tw:justify-between"
    >
      <div class="tw:flex tw:items-center tw:gap-3">
        <div
          class="tw:w-10 tw:h-10 tw:rounded-lg tw:bg-gray-100 tw:flex tw:items-center tw:justify-center"
        >
          <QIcon name="link" class="tw:text-secondary" size="sm" />
        </div>
        <h3 class="tw:text-lg tw:font-bold tw:text-on-main">Linked Documents</h3>
        <QBadge
          v-if="linkedDocuments.length"
          color="grey-5"
          textColor="grey-8"
          class="tw:rounded-full"
        >
          <span class="tw:text-[10px] tw:px-2 tw:py-0.5 tw:font-bold">
            {{ linkedDocuments.length }}
          </span>
        </QBadge>
      </div>
      <WBtn
        v-if="canUpdate"
        label="Link Document"
        icon="add_link"
        color="primary"
        outline
        size="sm"
        @click="openAddDialog"
      />
    </div>

    <div v-if="linkedDocuments.length" class="tw:divide-y tw:divide-divider">
      <div
        v-for="ld in linkedDocuments"
        :key="ld.id"
        class="tw:p-4 tw:flex tw:items-center tw:gap-4 tw:hover:bg-main-hover tw:transition-colors"
      >
        <div
          class="tw:w-10 tw:h-10 tw:rounded-lg tw:bg-primary/10 tw:flex tw:items-center tw:justify-center tw:shrink-0"
        >
          <QIcon name="article" color="primary" size="sm" />
        </div>
        <div class="tw:flex-1 tw:min-w-0">
          <p class="tw:text-sm tw:font-medium tw:text-on-main tw:truncate">
            {{ ld.documentVersion?.document?.docNumber }} —
            {{ ld.documentVersion?.document?.title || 'Document' }}
          </p>
          <div class="tw:flex tw:items-center tw:gap-2 tw:mt-0.5">
            <span
              v-if="ld.documentVersion?.document?.documentType"
              class="tw:text-xs tw:text-secondary"
            >
              {{ ld.documentVersion.document.documentType.name }}
            </span>
            <WStatusBadge
              v-if="ld.documentVersion?.document?.statusId"
              :status="ld.documentVersion.document.statusId"
              size="xs"
            />
          </div>
        </div>
        <WBtn
          v-if="canUpdate"
          flat
          round
          dense
          icon="link_off"
          color="negative"
          size="sm"
          @click="onRemoveDocument(ld)"
        />
      </div>
    </div>

    <div v-else class="tw:py-12 tw:text-center">
      <QIcon name="link_off" size="40px" class="tw:text-secondary/50 tw:mb-2" />
      <p class="tw:text-secondary tw:text-sm">No documents linked to this supplier.</p>
      <p class="tw:text-secondary/70 tw:text-xs tw:mt-1">
        Link documents from your document management system.
      </p>
    </div>

    <!-- Add Link Dialog -->
    <WDialog v-model="showAddDialog" title="Link Document" persistent>
      <div class="tw:p-4 tw:space-y-4">
        <WSelect
          v-model="selectedDocumentVersionId"
          :options="availableDocuments"
          :loading="loadingDocs"
          label="Select Document"
          outlined
          dense
          emitValue
          mapOptions
          optionLabel="label"
          optionValue="value"
          hideBottomSpace
          useInput
          inputDebounce="200"
        />
      </div>
      <template #actions>
        <WBtn flat label="Cancel" @click="showAddDialog = false" />
        <WBtn
          color="primary"
          label="Link"
          unelevated
          :loading="saving"
          :disable="!selectedDocumentVersionId"
          @click="onAddDocument"
        />
      </template>
    </WDialog>
  </div>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { useDocuments } from '@/composables/useDocuments.js'
import { currentCompany } from '@/utils/currentCompany.js'
import { get } from '@/api'

const props = defineProps({
  documentId: {
    type: String,
    required: true,
  },
  document: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['refresh'])
const $q = useQuasar()
const { createLink, deleteLink } = useDocuments()

const links = computed(() => {
  return props.document?.links || []
})

const showAddDialog = ref(false)
const linkForm = ref({
  targetDocumentId: '',
  linkType: 'RELATED',
})

// Fetch available documents for linking
const availableDocuments = ref([])
const loadingDocs = ref(false)

async function fetchAvailableDocuments() {
  const companyId = currentCompany.value?.id
  const data = await get('/v1/services/documents', {
    params: { companyId },
    loader: loadingDocs,
  })
  // Exclude current document
  availableDocuments.value = (data.documents || [])
    .filter((d) => d.id !== props.documentId)
    .map((d) => ({
      label: `${d.docNumber} - ${d.title}`,
      value: d.id,
    }))
}

async function onAddLink() {
  if (!linkForm.value.targetDocumentId) {
    $q.notify({ type: 'warning', message: 'Select a document to link' })
    return
  }

  const result = await createLink(props.documentId, {
    targetDocumentId: linkForm.value.targetDocumentId,
    linkType: linkForm.value.linkType,
  })

  if (result.error) {
    $q.notify({ type: 'negative', message: result.error })
  } else {
    $q.notify({ type: 'positive', message: 'Link created' })
    showAddDialog.value = false
    linkForm.value = { targetDocumentId: '', linkType: 'RELATED' }
    emit('refresh')
  }
}

async function onDeleteLink(link) {
  $q.dialog({
    title: 'Remove Link',
    message: 'Are you sure you want to remove this link?',
    cancel: true,
  }).onOk(async () => {
    const result = await deleteLink(props.documentId, link.id)
    if (result.error) {
      $q.notify({ type: 'negative', message: result.error })
    } else {
      $q.notify({ type: 'positive', message: 'Link removed' })
      emit('refresh')
    }
  })
}

function openAddDialog() {
  fetchAvailableDocuments()
  showAddDialog.value = true
}

function getLinkTypeBadgeColor(linkType) {
  const map = {
    RELATED: 'primary',
    SUPERSEDES: 'orange',
    REFERENCES: 'info',
    PARENT: 'positive',
    CHILD: 'positive',
  }
  return map[linkType] || 'grey-6'
}
</script>

<template>
  <div class="tw:p-6">
    <div class="tw:flex tw:items-center tw:justify-between tw:mb-4">
      <h3 class="tw:text-lg tw:font-bold tw:text-on-sidebar">Document Links</h3>
      <WBtn
        label="Add Link"
        icon="add_link"
        color="primary"
        outline
        size="sm"
        @click="openAddDialog"
      />
    </div>

    <!-- Links List -->
    <div v-if="links.length > 0" class="tw:space-y-2">
      <div
        v-for="link in links"
        :key="link.id"
        class="tw:flex tw:items-center tw:justify-between tw:p-3 tw:bg-main-hover tw:rounded-lg tw:border tw:border-divider"
      >
        <div class="tw:flex tw:items-center tw:gap-3">
          <WIcon name="link" size="20px" class="tw:text-primary" />
          <div>
            <div class="tw:text-sm tw:font-semibold tw:text-on-sidebar">
              {{ link.targetDocument?.docNumber || link.targetDocumentId }}
              <span class="tw:font-normal tw:text-secondary">
                {{ link.targetDocument?.title ? `— ${link.targetDocument.title}` : '' }}
              </span>
            </div>
          </div>
          <QBadge :color="getLinkTypeBadgeColor(link.linkType)" outline class="tw:ml-2">
            {{ link.linkType }}
          </QBadge>
        </div>
        <WBtn
          flat
          round
          dense
          icon="delete"
          color="negative"
          size="sm"
          @click="onDeleteLink(link)"
        />
      </div>
    </div>

    <!-- Empty -->
    <div v-else class="tw:text-center tw:py-8 tw:text-secondary">
      <WIcon name="link_off" size="40px" class="tw:text-secondary tw:mb-2" />
      <div>No linked documents.</div>
      <div class="tw:text-xs tw:mt-1">
        Link related documents, references, or parent/child relationships.
      </div>
    </div>

    <!-- Add Link Dialog -->
    <WDialog v-model="showAddDialog" title="Add Document Link" persistent>
      <div class="tw:p-4 tw:space-y-4">
        <WSelect
          v-model="linkForm.targetDocumentId"
          :options="availableDocuments"
          :loading="loadingDocs"
          label="Target Document"
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
        <WSelect
          v-model="linkForm.linkType"
          :options="[
            { label: 'Related', value: 'RELATED' },
            { label: 'Supersedes', value: 'SUPERSEDES' },
            { label: 'References', value: 'REFERENCES' },
            { label: 'Parent', value: 'PARENT' },
            { label: 'Child', value: 'CHILD' },
          ]"
          label="Link Type"
          outlined
          dense
          emitValue
          mapOptions
          optionLabel="label"
          optionValue="value"
          hideBottomSpace
        />
      </div>
      <template #actions>
        <WBtn flat label="Cancel" @click="showAddDialog = false" />
        <WBtn
          color="primary"
          label="Add Link"
          unelevated
          :disable="!linkForm.targetDocumentId"
          @click="onAddLink"
        />
      </template>
    </WDialog>
  </div>
</template>

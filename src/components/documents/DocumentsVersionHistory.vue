<script setup>
import { useQuasar } from 'quasar'
import { useDocuments } from '@/composables/useDocuments.js'

const props = defineProps({
  documentId: {
    type: String,
    required: true,
  },
  canUpdate: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['refresh'])
const $q = useQuasar()
const { fetchVersions, createVersion } = useDocuments()

const versions = ref([])
const loading = ref(true)
const showNewVersionDialog = ref(false)

const newVersionForm = ref({
  changeNotes: '',
  content: '',
})

const columns = [
  { name: 'version', label: 'VERSION', field: 'version', align: 'left' },
  { name: 'status', label: 'STATUS', field: 'statusId', align: 'left' },
  { name: 'creator', label: 'CREATED BY', field: 'creator', align: 'left' },
  { name: 'createdAt', label: 'CREATED', field: 'createdAt', align: 'left', sortable: true },
  { name: 'effectiveDate', label: 'EFFECTIVE', field: 'effectiveDate', align: 'left' },
  { name: 'changeNotes', label: 'CHANGE NOTES', field: 'changeNotes', align: 'left' },
]

function getVersionLabel(row) {
  return row.versionLabel || `${row.versionMajor}.${row.versionMinor}`
}

function getCreatorName(row) {
  if (!row.creator) return '-'
  return `${row.creator.firstName} ${row.creator.lastName}`.trim()
}

async function loadVersions() {
  loading.value = true
  const result = await fetchVersions(props.documentId)
  if (result.versions) {
    versions.value = result.versions
  }
  loading.value = false
}

async function onCreateVersion() {
  const result = await createVersion(props.documentId, {
    changeNotes: newVersionForm.value.changeNotes,
    content: newVersionForm.value.content,
  })

  if (result.error) {
    $q.notify({ type: 'negative', message: result.error })
  } else {
    $q.notify({ type: 'positive', message: 'New version created' })
    showNewVersionDialog.value = false
    newVersionForm.value = { changeNotes: '', content: '' }
    await loadVersions()
    emit('refresh')
  }
}

onMounted(() => {
  loadVersions()
})
</script>

<template>
  <div class="tw:p-6">
    <div class="tw:flex tw:items-center tw:justify-between tw:mb-4">
      <h3 class="tw:text-lg tw:font-bold tw:text-on-sidebar">Version History</h3>
      <WBtn
        v-if="canUpdate"
        label="New Version"
        icon="add"
        color="primary"
        outline
        size="sm"
        @click="showNewVersionDialog = true"
      />
    </div>

    <WTable :rows="versions" :columns="columns" :loading="loading" hideTop noBorder flat>
      <template #body-cell-version="slotProps">
        <QTd :props="slotProps">
          <span class="tw:font-mono tw:font-bold">{{ getVersionLabel(slotProps.row) }}</span>
        </QTd>
      </template>

      <template #body-cell-status="slotProps">
        <QTd :props="slotProps">
          <WStatusBadge :status="slotProps.row.statusId" variant="document" />
        </QTd>
      </template>

      <template #body-cell-creator="slotProps">
        <QTd :props="slotProps">
          <span class="tw:text-sm">{{ getCreatorName(slotProps.row) }}</span>
        </QTd>
      </template>

      <template #body-cell-createdAt="slotProps">
        <QTd :props="slotProps">
          <span class="tw:text-sm tw:text-secondary">{{
            slotProps.row.createdAt.formatDate('date')
          }}</span>
        </QTd>
      </template>

      <template #body-cell-effectiveDate="slotProps">
        <QTd :props="slotProps">
          <span class="tw:text-sm tw:text-secondary">{{
            slotProps.row.effectiveDate.formatDate('date')
          }}</span>
        </QTd>
      </template>

      <template #body-cell-changeNotes="slotProps">
        <QTd :props="slotProps">
          <span class="tw:text-sm tw:text-secondary">{{ slotProps.row.changeNotes || '-' }}</span>
        </QTd>
      </template>
    </WTable>

    <!-- New Version Dialog -->
    <WDialog v-model="showNewVersionDialog" title="Create New Version" persistent>
      <div class="tw:p-4 tw:space-y-4">
        <WInput
          v-model="newVersionForm.changeNotes"
          label="Change Notes *"
          placeholder="Describe what changed in this version..."
          type="textarea"
          outlined
          hideBottomSpace
        />
        <TextEditor
          v-model="newVersionForm.content"
          placeholder="Version content (optional — copies from previous if empty)"
          contentType="html"
          class="tw:min-h-[200px]"
        />
      </div>
      <template #actions>
        <WBtn flat label="Cancel" @click="showNewVersionDialog = false" />
        <WBtn
          color="primary"
          label="Create Version"
          unelevated
          :disable="!newVersionForm.changeNotes.trim()"
          @click="onCreateVersion"
        />
      </template>
    </WDialog>
  </div>
</template>

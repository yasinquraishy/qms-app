<script setup>
import { useQuasar } from 'quasar'
import { currentSession } from '@/utils/currentSession.js'

const props = defineProps({
  documentId: {
    type: String,
    required: true,
  },
  versionId: {
    type: String,
    default: null,
  },
})

const $q = useQuasar()

const links = useLiveQueryWithDeps(
  [() => props.versionId],
  async (db, [versionId]) => {
    if (!versionId) return []
    const all = await db.DocumentLink.where().exec()
    return all.filter((l) => l.fromDocumentVersionId === versionId && !l.deletedAt)
  },
  { initial: [] },
)

const allDocuments = useLiveQuery(async (db) => db.Document.where().exec(), { initial: [] })
const allVersions = useLiveQuery(async (db) => db.DocumentVersion.where().exec(), { initial: [] })

const documentsById = computed(() => {
  const map = {}
  for (const d of allDocuments.value) map[d.id] = d
  return map
})

const versionsById = computed(() => {
  const map = {}
  for (const v of allVersions.value) map[v.id] = v
  return map
})

const availableDocuments = computed(() =>
  (allDocuments.value ?? [])
    .filter((d) => d.id !== props.documentId)
    .map((d) => ({ label: `${d.docNumber} - ${d.title}`, value: d.id })),
)

const showAddDialog = ref(false)
const linkForm = ref({
  targetDocumentId: '',
  linkType: 'RELATED',
})

function getTargetDocument(link) {
  const version = versionsById.value[link.toDocumentVersionId]
  if (!version) return null
  return documentsById.value[version.documentId]
}

async function onAddLink() {
  if (!linkForm.value.targetDocumentId) {
    $q.notify({ type: 'warning', message: 'Select a document to link' })
    return
  }

  const add = useLiveMutation(async (db) => {
    const latestVersion = await db.DocumentVersion.where(
      'documentId',
      linkForm.value.targetDocumentId,
    )
      .orderBy('createdAt', 'desc')
      .first()

    if (!latestVersion) throw new Error('Target document has no versions')

    const link = db.DocumentLink.create({
      fromDocumentVersionId: props.versionId,
      toDocumentVersionId: latestVersion.id,
      relationshipType: linkForm.value.linkType,
      createdBy: currentSession.value?.userId || '',
    })
    await link.save()
    return link
  })

  try {
    await add()
    $q.notify({ type: 'positive', message: 'Link created' })
    showAddDialog.value = false
    linkForm.value = { targetDocumentId: '', linkType: 'RELATED' }
  } catch (err) {
    $q.notify({ type: 'negative', message: err.message || 'Failed to create link' })
  }
}

async function onDeleteLink(link) {
  $q.dialog({
    title: 'Remove Link',
    message: 'Are you sure you want to remove this link?',
    cancel: true,
  }).onOk(async () => {
    await link.delete()
    $q.notify({ type: 'positive', message: 'Link removed' })
  })
}

function openAddDialog() {
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
              {{ getTargetDocument(link)?.docNumber || link.toDocumentVersionId }}
              <span class="tw:font-normal tw:text-secondary">
                {{ getTargetDocument(link)?.title ? `— ${getTargetDocument(link).title}` : '' }}
              </span>
            </div>
          </div>
          <QBadge :color="getLinkTypeBadgeColor(link.relationshipType)" outline class="tw:ml-2">
            {{ link.relationshipType }}
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

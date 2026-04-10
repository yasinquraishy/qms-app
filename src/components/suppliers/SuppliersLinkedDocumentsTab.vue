<script setup>
import { IconLink, IconLinkOff, IconFilePlus, IconFileDescription } from '@tabler/icons-vue'
import { isAllowed } from '@/utils/currentSession.js'

const props = defineProps({
  supplierId: {
    type: String,
    required: true,
  },
})

const canUpdate = computed(() => isAllowed(['suppliers:update']))

// ─── Live queries ─────────────────────────────────────────────────────────────

const linkedDocs = useLiveQueryWithDeps(
  [() => props.supplierId],
  async (db, [supplierId]) => {
    const sds = await db.SupplierDocument.where('supplierId', supplierId).exec()
    return Promise.all(
      sds.map(async (sd) => {
        const version = await db.DocumentVersion.findByPk(sd.documentVersionId)
        const document = version ? await db.Document.findByPk(version.documentId) : null
        return { sd, version, document }
      }),
    )
  },
  { initial: [] },
)

const allLatestVersions = useLiveQuery(
  async (db) => {
    const versions = await db.DocumentVersion.where().exec()
    const latest = versions.filter((v) => v.isLatest)
    const resolved = await Promise.all(
      latest.map(async (v) => {
        const doc = await db.Document.findByPk(v.documentId)
        if (!doc) return null
        return { id: v.id, label: `${doc.docNumber} — ${doc.title}` }
      }),
    )
    return resolved.filter(Boolean)
  },
  { initial: [] },
)

const linkedVersionIds = computed(
  () => new Set(linkedDocs.value.map((e) => e.sd.documentVersionId)),
)

const availableItems = computed(() =>
  allLatestVersions.value.filter((v) => !linkedVersionIds.value.has(v.id)),
)

// ─── Add document ─────────────────────────────────────────────────────────────

const showAddDialog = ref(false)
const selectedVersionId = ref(null)
const saving = ref(false)

const addDoc = useLiveMutation(async (db, { supplierId, documentVersionId }) => {
  const sd = db.SupplierDocument.create({ supplierId, documentVersionId })
  await sd.save()
  return sd
})

function openAddDialog() {
  selectedVersionId.value = null
  showAddDialog.value = true
}

async function onAddDocument() {
  if (!selectedVersionId.value) return
  saving.value = true
  try {
    await addDoc({ supplierId: props.supplierId, documentVersionId: selectedVersionId.value })
    showAddDialog.value = false
  } finally {
    saving.value = false
  }
}

// ─── Remove document ──────────────────────────────────────────────────────────

const confirmDialog = ref(null)

function onRemoveDocument(entry) {
  confirmDialog.value = {
    title: 'Remove Link',
    message: 'Are you sure you want to unlink this document from the supplier?',
    okLabel: 'Remove',
    onOk: async () => {
      await entry.sd.delete()
      confirmDialog.value = null
    },
  }
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
          <IconLink :size="20" class="tw:text-secondary" />
        </div>
        <h3 class="tw:text-lg tw:font-bold tw:text-on-main">Linked Documents</h3>
        <span
          v-if="linkedDocs.length"
          class="tw:inline-flex tw:items-center tw:justify-center tw:rounded-full tw:bg-gray-200 tw:text-gray-700 tw:px-2 tw:py-0.5 tw:text-[10px] tw:font-bold"
        >
          {{ linkedDocs.length }}
        </span>
      </div>
      <BaseButton v-if="canUpdate" variant="outline" @click="openAddDialog">
        <IconFilePlus :size="16" />
        <span>Link Document</span>
      </BaseButton>
    </div>

    <div v-if="linkedDocs.length" class="tw:divide-y tw:divide-divider">
      <div
        v-for="entry in linkedDocs"
        :key="entry.sd.id"
        class="tw:p-4 tw:flex tw:items-center tw:gap-4 tw:hover:bg-main-hover tw:transition-colors"
      >
        <div
          class="tw:w-10 tw:h-10 tw:rounded-lg tw:bg-primary/10 tw:flex tw:items-center tw:justify-center tw:shrink-0"
        >
          <IconFileDescription :size="20" class="tw:text-primary" />
        </div>
        <div class="tw:flex-1 tw:min-w-0">
          <p class="tw:text-sm tw:font-medium tw:text-on-main tw:truncate">
            <template v-if="entry.document">
              {{ entry.document.docNumber }} — {{ entry.document.title || 'Document' }}
            </template>
            <template v-else>Document</template>
          </p>
          <div class="tw:flex tw:items-center tw:gap-2 tw:mt-0.5">
            <SupplierStatusBadgeById
              v-if="entry.document?.statusId"
              :statusId="entry.document.statusId"
            />
          </div>
        </div>
        <button
          v-if="canUpdate"
          class="tw:p-1.5 tw:rounded tw:text-red-400 tw:hover:text-red-600 tw:hover:bg-red-50 tw:transition-colors"
          title="Unlink document"
          @click="onRemoveDocument(entry)"
        >
          <IconLinkOff :size="16" />
        </button>
      </div>
    </div>

    <div v-else class="tw:py-12 tw:text-center">
      <IconLinkOff :size="40" class="tw:text-secondary/50 tw:mb-2" />
      <p class="tw:text-secondary tw:text-sm">No documents linked to this supplier.</p>
      <p class="tw:text-secondary/70 tw:text-xs tw:mt-1">
        Link documents from your document management system.
      </p>
    </div>
  </div>

  <!-- Add Document Dialog -->
  <BaseDialog v-model="showAddDialog" title="Link Document" maxWidth="sm">
    <div class="tw:p-4 tw:space-y-4">
      <div>
        <label class="tw:block tw:text-sm tw:font-medium tw:text-on-main tw:mb-1">
          Select Document
        </label>
        <BaseSelectMenu v-model="selectedVersionId" :items="availableItems" :required="true">
          <template #button="scope">
            <slot name="button" v-bind="scope">
              <span v-if="selectedVersionId" class="tw:text-sm tw:font-medium">
                {{
                  availableItems.find((i) => i.id === selectedVersionId)?.label || selectedVersionId
                }}
              </span>
              <span v-else class="tw:text-sm tw:font-medium tw:text-placeholder"
                >Choose a document</span
              >
            </slot>
          </template>
        </BaseSelectMenu>
      </div>
    </div>
    <div class="tw:flex tw:justify-end tw:gap-2 tw:px-4 tw:pb-4">
      <BaseButton variant="ghost" @click="showAddDialog = false">Cancel</BaseButton>
      <BaseButton :disabled="!selectedVersionId || saving" @click="onAddDocument">
        <div
          v-if="saving"
          class="tw:animate-spin tw:rounded-full tw:size-4 tw:border-2 tw:border-white tw:border-t-transparent"
        />
        <span>{{ saving ? 'Linking...' : 'Link' }}</span>
      </BaseButton>
    </div>
  </BaseDialog>

  <ConfirmDialog
    v-if="confirmDialog"
    :modelValue="true"
    v-bind="confirmDialog"
    @update:modelValue="confirmDialog = null"
    @ok="confirmDialog?.onOk"
  />
</template>

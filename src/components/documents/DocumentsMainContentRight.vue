<script setup>
import { isAllowed } from '@/utils/currentSession.js'
import { IconSettings } from '@tabler/icons-vue'

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

const document = useLiveQueryWithDeps([() => props.documentId], async (db, [id]) => {
  return db.Document.findByPk(id)
})

const currentVersion = useLiveQueryWithDeps([() => props.versionId], async (db, [id]) => {
  return id ? db.DocumentVersion.findByPk(id) : null
})

const canEdit = computed(
  () => isAllowed(['documents:update']) && document.value?.statusId !== 'ARCHIVED',
)

// State
const activeSection = ref(null)

// Computed properties
const documentSections = computed(() => {
  return currentVersion.value?.sections || []
})

// Section methods
function scrollToSection(sectionId) {
  const element = window.document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
    activeSection.value = sectionId
  }
}

const debounceSaveDocument = useDebounceFn(() => {
  if (!document.value || !canEdit.value) return
  document.value.save()
}, 500)

const debounceSaveVersion = useDebounceFn(() => {
  if (!currentVersion.value || !canEdit.value) return
  currentVersion.value.save()
}, 500)

watch(
  document,
  () => {
    debounceSaveDocument()
  },
  { deep: true },
)

watch(
  currentVersion,
  () => {
    debounceSaveVersion()
  },
  { deep: true },
)
</script>

<template>
  <div v-if="document && currentVersion" class="tw:lg:col-span-1 tw:space-y-6 tw:print:hidden">
    <div class="tw:sticky tw:top-24 tw:space-y-6">
      <!-- Properties Card -->
      <div class="tw:bg-sidebar tw:rounded-xl tw:shadow-sm tw:border tw:border-divider tw:p-5">
        <h4 class="ds-label tw:text-secondary tw:mb-4 tw:flex tw:items-center tw:justify-between">
          Properties
          <IconSettings class="tw:size-4" />
        </h4>
        <div class="tw:space-y-4">
          <div>
            <label class="ds-label"> Document ID </label>
            <p class="tw:text-sm tw:font-semibold tw:text-on-sidebar">
              {{ document.docNumber }}
            </p>
          </div>

          <div class="tw:flex tw:flex-col">
            <label class="ds-label tw:mb-2"> Owner </label>
            <UserBadgeById :userId="document.userId" />
          </div>

          <div class="tw:grid tw:grid-cols-2 tw:gap-4">
            <div>
              <label class="ds-label"> Type </label>
              <div class="tw:mt-1">
                <DocumentTypeBadgeById
                  :documentTypeId="document.documentTypeId"
                  :iconOnly="false"
                />
              </div>
            </div>

            <div class="tw:flex tw:flex-col tw:w-fit">
              <label class="ds-label"> Status </label>

              <DocumentVersionStatusBadgeById :statusId="currentVersion.statusId" />
            </div>
          </div>

          <div>
            <label class="ds-label"> Department </label>
            <div class="tw:mt-1">
              <DepartmentSelectMenu v-model="document.departmentId" required />
            </div>
          </div>

          <div>
            <label class="ds-label"> Related Standard </label>
            <div class="tw:mt-1">
              <RelatedStandardSelectMenu v-model="document.relatedStandardId" />
            </div>
          </div>

          <div>
            <label class="ds-label"> Periodic Review </label>
            <p class="tw:text-sm tw:font-medium">{{ document.periodicReviewMonths }} months</p>
          </div>

          <div>
            <label class="ds-label"> Auto-Effective </label>
            <p class="tw:text-sm tw:font-medium">
              <BaseSwitch v-model="document.autoEffectiveOnApproval" :disabled="!canEdit" />
            </p>
          </div>

          <div>
            <label class="ds-label"> Effective Date </label>
            <BaseDatePicker
              v-if="canEdit"
              v-model="currentVersion.effectiveDate"
              :required="false"
            />
          </div>

          <!-- Collaborators Section -->
          <DocumentsCollaborators :documentId="document.id" :canEdit="canEdit" />
        </div>
      </div>

      <!-- Table of Contents Card -->
      <div class="tw:bg-sidebar tw:rounded-xl tw:shadow-sm tw:border tw:border-divider tw:p-5">
        <div class="tw:flex tw:items-center tw:justify-between tw:mb-4">
          <h4 class="ds-label tw:text-secondary">Table of Contents</h4>
        </div>
        <nav class="tw:space-y-1">
          <a
            v-for="(section, index) in documentSections"
            :key="section.id"
            :href="`#${section.id}`"
            class="tw:group tw:flex tw:items-center tw:gap-3 tw:px-3 tw:py-2 tw:rounded-lg tw:text-sm tw:font-medium tw:transition-colors"
            :class="
              activeSection === section.id
                ? 'tw:text-primary tw:bg-primary/5'
                : 'tw:text-secondary tw:hover:bg-sidebar-hover'
            "
            @click.prevent="scrollToSection(section.id)"
          >
            <span
              class="tw:text-xs tw:font-bold"
              :class="
                activeSection === section.id
                  ? 'tw:text-primary/50'
                  : 'tw:text-secondary tw:group-hover:text-primary/50'
              "
            >
              {{ index + 1 }}.
            </span>
            {{ section.title }}
          </a>

          <!-- Empty state -->
          <div
            v-if="documentSections.length === 0"
            class="tw:text-center tw:py-4 tw:text-secondary tw:text-xs"
          >
            No sections available
          </div>
        </nav>
      </div>
    </div>
  </div>
</template>

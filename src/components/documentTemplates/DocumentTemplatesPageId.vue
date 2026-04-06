<script setup>
import { useQuasar } from 'quasar'
import { useDocumentTemplates } from '@/composables/useDocumentTemplates.js'
import { isAllowed } from '@/utils/currentSession.js'
import { getCompanyPath } from '@/utils/routeHelpers.js'

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const router = useRouter()
const $q = useQuasar()
const { fetchDocumentTemplate, updateDocumentTemplate } = useDocumentTemplates()

const template = ref(null)
const loading = ref(true)

const canUpdate = computed(() => isAllowed(['document-templates:update']))
const canArchive = computed(() => isAllowed(['document-templates:delete']))

const breadcrumbs = computed(() => [
  { label: 'Document Templates', to: getCompanyPath('/document-templates') },
  { label: template.value?.name || 'Template', to: null },
])

const formattedCreatedDate = computed(() => {
  return template.value?.createdAt?.formatDate('date')
})

const formattedUpdatedDate = computed(() => {
  return template.value?.updatedAt?.formatDate('date')
})

const sectionTypeBadgeColor = {
  text: 'blue',
  attachment: 'purple',
  form: 'green',
  table: 'orange',
}

function getSectionTypeBadgeColor(type) {
  return sectionTypeBadgeColor[type] || 'grey'
}

async function loadTemplate() {
  loading.value = true
  const result = await fetchDocumentTemplate(props.id)
  if (result.error) {
    $q.notify({ type: 'negative', message: result.error })
    router.push(getCompanyPath('/document-templates'))
  } else {
    template.value = result.documentTemplate
  }
  loading.value = false
}

async function onArchive() {
  if (!template.value) return

  $q.dialog({
    title: 'Confirm Archive',
    message: `Are you sure you want to archive "${template.value.name}"? This will make it unavailable for new documents.`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const result = await updateDocumentTemplate(props.id, { statusId: 'ARCHIVED' })
    if (result.error) {
      $q.notify({ type: 'negative', message: result.error })
    } else {
      $q.notify({ type: 'positive', message: 'Template archived successfully' })
      router.push(getCompanyPath('/document-templates'))
    }
  })
}

async function onUnarchive() {
  if (!template.value) return

  $q.dialog({
    title: 'Confirm Unarchive',
    message: `Are you sure you want to unarchive "${template.value.name}"?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const result = await updateDocumentTemplate(props.id, { statusId: 'ACTIVE' })
    if (result.error) {
      $q.notify({ type: 'negative', message: result.error })
    } else {
      $q.notify({ type: 'positive', message: 'Template unarchived successfully' })
      router.push(getCompanyPath('/document-templates'))
    }
  })
}

function goBack() {
  router.push(getCompanyPath('/document-templates'))
}

function navigateToEdit() {
  router.push(getCompanyPath(`/document-templates/${props.id}?mode=edit`))
}

onMounted(() => {
  loadTemplate()
})

watch(
  () => props.id,
  () => {
    loadTemplate()
  },
)
</script>

<template>
  <div class="tw:flex tw:flex-col tw:h-full">
    <SafeTeleport to="#main-header-title">
      <WBreadcrumbs :items="breadcrumbs" />
    </SafeTeleport>

    <SafeTeleport to="#main-header-actions">
      <div class="tw:flex tw:items-center tw:gap-3">
        <WBtn
          v-if="canUpdate"
          outline
          icon="edit"
          label="Edit"
          color="primary"
          @click="navigateToEdit"
        />
        <WBtn
          v-if="canArchive && template?.statusId !== 'ARCHIVED'"
          outline
          icon="inventory_2"
          label="Archive"
          color="negative"
          @click="onArchive"
        />
        <WBtn
          v-if="canArchive && template?.statusId === 'ARCHIVED'"
          outline
          icon="unarchive"
          label="Unarchive"
          color="primary"
          @click="onUnarchive"
        />
      </div>
    </SafeTeleport>

    <!-- Loading State -->
    <div v-if="loading" class="tw:flex tw:items-center tw:justify-center tw:h-full">
      <QSpinner color="primary" size="50px" />
    </div>

    <!-- Template Details -->
    <div v-else-if="template" class="tw:flex-1 tw:overflow-y-auto tw:p-6">
      <div class="tw:max-w-5xl tw:mx-auto tw:space-y-6">
        <!-- Header -->
        <div class="tw:flex tw:items-start tw:justify-between">
          <div>
            <div class="tw:flex tw:items-center tw:gap-3 tw:mb-2">
              <h1 class="tw:text-3xl tw:font-black tw:text-on-sidebar">{{ template.name }}</h1>

              <DocumentTemplateStatusBadge :status="template.statusId" />
            </div>
            <p class="tw:text-secondary">
              Document prefix:
              <span class="tw:font-mono tw:font-bold">{{ template.prefix }}</span>
            </p>
          </div>
        </div>

        <!-- Basic Information Card -->
        <WCard>
          <div
            class="tw:px-6 tw:py-4 tw:border-b tw:border-divider tw:flex tw:items-center tw:gap-2"
          >
            <WIcon name="info" class="tw:text-primary" size="22px" />
            <h2 class="tw:text-lg tw:font-bold tw:text-on-sidebar">Basic Information</h2>
          </div>
          <div class="tw:p-6 tw:grid tw:grid-cols-2 tw:gap-6">
            <div>
              <div class="tw:text-xs tw:font-bold tw:text-secondary tw:uppercase tw:mb-1">
                Template Name
              </div>
              <div class="tw:text-on-sidebar">{{ template.name }}</div>
            </div>
            <div>
              <div class="tw:text-xs tw:font-bold tw:text-secondary tw:uppercase tw:mb-1">
                Document Prefix
              </div>
              <div class="tw:font-mono tw:font-bold tw:text-on-sidebar">
                {{ template.prefix }}
              </div>
            </div>
            <div>
              <div class="tw:text-xs tw:font-bold tw:text-secondary tw:uppercase tw:mb-1">
                Department
              </div>
              <div class="tw:text-on-sidebar">
                {{ template.department?.name || '-' }}
              </div>
            </div>
            <div>
              <div class="tw:text-xs tw:font-bold tw:text-secondary tw:uppercase tw:mb-1">
                Related Standard
              </div>
              <div class="tw:text-on-sidebar">
                {{ template.relatedStandard?.name || '-' }}
              </div>
            </div>
            <div>
              <div class="tw:text-xs tw:font-bold tw:text-secondary tw:uppercase tw:mb-1">
                Created Date
              </div>
              <div class="tw:text-on-sidebar">{{ formattedCreatedDate }}</div>
            </div>
            <div>
              <div class="tw:text-xs tw:font-bold tw:text-secondary tw:uppercase tw:mb-1">
                Last Modified
              </div>
              <div class="tw:text-on-sidebar">{{ formattedUpdatedDate }}</div>
            </div>
          </div>
        </WCard>

        <!-- Default Settings Card -->
        <WCard>
          <div
            class="tw:px-6 tw:py-4 tw:border-b tw:border-divider tw:flex tw:items-center tw:gap-2"
          >
            <WIcon name="settings" class="tw:text-primary" size="22px" />
            <h2 class="tw:text-lg tw:font-bold tw:text-on-sidebar">Default Settings</h2>
          </div>
          <div class="tw:p-6 tw:grid tw:grid-cols-2 tw:md:grid-cols-3 tw:gap-6">
            <div>
              <div class="tw:text-xs tw:font-bold tw:text-secondary tw:uppercase tw:mb-1">
                Training Available
              </div>
              <div class="tw:flex tw:items-center tw:gap-2">
                <WIcon
                  :name="template.trainingAvailable ? 'check_circle' : 'cancel'"
                  :class="template.trainingAvailable ? 'tw:text-green-600' : 'tw:text-gray-400'"
                  size="20px"
                />
                <span>{{ template.trainingAvailable ? 'Yes' : 'No' }}</span>
              </div>
            </div>
            <div>
              <div class="tw:text-xs tw:font-bold tw:text-secondary tw:uppercase tw:mb-1">
                Retraining on Version
              </div>
              <div class="tw:flex tw:items-center tw:gap-2">
                <WIcon
                  :name="template.retrainingOnVersion ? 'check_circle' : 'cancel'"
                  :class="template.retrainingOnVersion ? 'tw:text-green-600' : 'tw:text-gray-400'"
                  size="20px"
                />
                <span>{{ template.retrainingOnVersion ? 'Yes' : 'No' }}</span>
              </div>
            </div>
            <div>
              <div class="tw:text-xs tw:font-bold tw:text-secondary tw:uppercase tw:mb-1">
                Periodic Review
              </div>
              <div class="tw:text-on-sidebar">{{ template.periodicReviewMonths }} months</div>
            </div>
            <div>
              <div class="tw:text-xs tw:font-bold tw:text-secondary tw:uppercase tw:mb-1">
                Review Limit
              </div>
              <div class="tw:text-on-sidebar">{{ template.reviewLimitDays }} days</div>
            </div>
            <div>
              <div class="tw:text-xs tw:font-bold tw:text-secondary tw:uppercase tw:mb-1">
                Approval Limit
              </div>
              <div class="tw:text-on-sidebar">{{ template.approvalLimitDays }} days</div>
            </div>
            <div>
              <div class="tw:text-xs tw:font-bold tw:text-secondary tw:uppercase tw:mb-1">
                Auto Effective
              </div>
              <div class="tw:flex tw:items-center tw:gap-2">
                <WIcon
                  :name="template.autoEffectiveOnApproval ? 'check_circle' : 'cancel'"
                  :class="
                    template.autoEffectiveOnApproval ? 'tw:text-green-600' : 'tw:text-gray-400'
                  "
                  size="20px"
                />
                <span>{{ template.autoEffectiveOnApproval ? 'Yes' : 'No' }}</span>
              </div>
            </div>
            <div>
              <div class="tw:text-xs tw:font-bold tw:text-secondary tw:uppercase tw:mb-1">
                Show Section Titles
              </div>
              <div class="tw:flex tw:items-center tw:gap-2">
                <WIcon
                  :name="template.showSectionTitles ? 'check_circle' : 'cancel'"
                  :class="template.showSectionTitles ? 'tw:text-green-600' : 'tw:text-gray-400'"
                  size="20px"
                />
                <span>{{ template.showSectionTitles ? 'Yes' : 'No' }}</span>
              </div>
            </div>
          </div>
        </WCard>

        <!-- Sections Preview Card -->
        <WCard>
          <div
            class="tw:px-6 tw:py-4 tw:border-b tw:border-divider tw:flex tw:items-center tw:gap-2"
          >
            <WIcon name="view_quilt" class="tw:text-primary" size="22px" />
            <h2 class="tw:text-lg tw:font-bold tw:text-on-sidebar">
              Template Sections ({{ template.sections?.length || 0 }})
            </h2>
          </div>
          <div class="tw:p-6">
            <div v-if="template.sections?.length" class="tw:space-y-3">
              <div
                v-for="section in template.sections"
                :key="section.id"
                class="tw:flex tw:items-center tw:gap-4 tw:p-4 tw:bg-main-hover tw:rounded-lg"
              >
                <div
                  class="tw:flex tw:items-center tw:justify-center tw:w-8 tw:h-8 tw:rounded-full tw:bg-primary/10 tw:text-primary tw:font-bold tw:text-sm"
                >
                  {{ section.order }}
                </div>
                <div class="tw:flex-1">
                  <div class="tw:font-bold tw:text-on-sidebar">{{ section.title }}</div>
                  <div v-if="section.defaultContent" class="tw:text-xs tw:text-secondary tw:mt-1">
                    {{ section.defaultContent.substring(0, 100)
                    }}{{ section.defaultContent.length > 100 ? '...' : '' }}
                  </div>
                </div>
                <QBadge
                  :color="getSectionTypeBadgeColor(section.sectionType)"
                  class="tw:px-3 tw:py-1 tw:font-medium"
                >
                  {{ section.sectionType.toUpperCase() }}
                </QBadge>
              </div>
            </div>
            <div v-else class="tw:text-center tw:py-8 tw:text-secondary">
              No sections defined for this template.
            </div>
          </div>
        </WCard>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="tw:flex tw:flex-col tw:items-center tw:justify-center tw:h-full tw:gap-4">
      <WIcon name="error" size="64px" class="tw:text-secondary" />
      <div class="tw:text-xl tw:text-secondary">Template not found</div>
      <WBtn outline label="Go Back" icon="arrow_back" @click="goBack" />
    </div>
  </div>
</template>

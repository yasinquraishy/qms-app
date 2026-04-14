<script setup>
import {
  IconInfoCircle,
  IconSettings,
  IconLayoutList,
  IconCircleCheck,
  IconCircleX,
  IconArchive,
  IconArchiveOff,
  IconArrowLeft,
} from '@tabler/icons-vue'
import { isAllowed } from '@/utils/currentSession.js'
import { getCompanyPath } from '@/utils/routeHelpers.js'

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

const router = useRouter()
const toast = useToast()

const template = useLiveQueryWithDeps([() => props.id], async (db, [id]) => {
  return db.DocumentTemplate.findByPk(id)
})

const loading = computed(() => template.value === undefined)
const canUpdate = computed(() => isAllowed(['document-templates:update']))
const canArchive = computed(() => isAllowed(['document-templates:delete']))

const isFirstLoad = ref(true)
const editingName = ref(false)

const debouncedSave = useDebounceFn(async () => {
  if (!template.value) return
  try {
    await template.value.save()
  } catch (err) {
    toast.error(err)
  }
}, 500)

watch(
  template,
  (t) => {
    if (isFirstLoad.value) {
      isFirstLoad.value = false
      return
    }
    if (t) debouncedSave()
  },
  { deep: true },
)

const breadcrumbs = computed(() => [
  { label: 'Document Templates', to: getCompanyPath('/document-templates') },
  { label: template.value?.name || 'Template' },
])

const SECTION_TYPE_MAP = {
  text: { label: 'TEXT', class: 'tw:bg-blue-100 tw:text-blue-700' },
  attachment: { label: 'ATTACHMENT', class: 'tw:bg-purple-100 tw:text-purple-700' },
  form: { label: 'FORM', class: 'tw:bg-green-100 tw:text-green-700' },
  table: { label: 'TABLE', class: 'tw:bg-orange-100 tw:text-orange-700' },
}

async function onArchive() {
  if (!template.value) return
  template.value.statusId = 'ARCHIVED'
  try {
    await template.value.save()
    router.push(getCompanyPath('/document-templates'))
  } catch {
    template.value.statusId = 'ACTIVE'
  }
}

async function onUnarchive() {
  if (!template.value) return
  template.value.statusId = 'ACTIVE'
  try {
    await template.value.save()
  } catch {
    template.value.statusId = 'ARCHIVED'
  }
}

function goBack() {
  router.push(getCompanyPath('/document-templates'))
}
</script>

<template>
  <div class="tw:flex tw:flex-col tw:h-full">
    <SafeTeleport to="#main-header-title">
      <BaseBreadcrumbs :items="breadcrumbs" />
    </SafeTeleport>

    <SafeTeleport to="#main-header-actions">
      <div class="tw:flex tw:items-center tw:gap-3">
        <button
          v-if="canArchive && template?.statusId !== 'ARCHIVED'"
          class="tw:flex tw:items-center tw:gap-2 tw:px-4 tw:py-2 tw:rounded-lg tw:border tw:border-red-300 tw:text-red-600 tw:text-sm tw:font-medium tw:hover:bg-red-50 tw:transition-colors"
          @click="onArchive"
        >
          <IconArchive :size="16" />
          Archive
        </button>
        <button
          v-if="canArchive && template?.statusId === 'ARCHIVED'"
          class="tw:flex tw:items-center tw:gap-2 tw:px-4 tw:py-2 tw:rounded-lg tw:border tw:border-primary tw:text-primary tw:text-sm tw:font-medium tw:hover:bg-primary/10 tw:transition-colors"
          @click="onUnarchive"
        >
          <IconArchiveOff :size="16" />
          Unarchive
        </button>
      </div>
    </SafeTeleport>

    <!-- Loading State -->
    <div v-if="loading" class="tw:flex tw:items-center tw:justify-center tw:h-full">
      <div
        class="tw:size-12 tw:animate-spin tw:rounded-full tw:border-2 tw:border-primary tw:border-t-transparent"
      />
    </div>

    <!-- Template Details -->
    <div v-else-if="template" class="tw:flex-1 tw:overflow-y-auto tw:p-6">
      <div class="tw:max-w-5xl tw:mx-auto tw:space-y-6">
        <!-- Header -->
        <div class="tw:flex tw:items-start tw:justify-between">
          <div>
            <div class="tw:flex tw:items-center tw:gap-3 tw:mb-2">
              <!-- Editable name -->
              <template v-if="editingName && canUpdate">
                <BaseTextInput
                  v-model="template.name"
                  placeholder="Template Name"
                  size="sm"
                  @keyup.enter="editingName = false"
                  @blur="editingName = false"
                />
              </template>
              <h1
                v-else
                class="tw:text-3xl tw:font-black tw:text-on-sidebar"
                :class="{ 'tw:cursor-pointer tw:hover:text-primary': canUpdate }"
                @click="canUpdate && (editingName = true)"
              >
                {{ template.name }}
              </h1>

              <DocumentTemplateStatusBadgeById :statusId="template.statusId" />
            </div>
            <p class="tw:text-secondary">
              Document prefix:
              <span class="tw:font-mono tw:font-bold">{{ template.prefix }}</span>
            </p>
          </div>
        </div>

        <!-- Basic Information Card -->
        <div class="tw:bg-sidebar tw:rounded-xl tw:border tw:border-divider tw:overflow-hidden">
          <div
            class="tw:px-6 tw:py-4 tw:border-b tw:border-divider tw:bg-main-hover tw:flex tw:items-center tw:gap-2"
          >
            <IconInfoCircle :size="22" class="tw:text-primary" />
            <h2 class="tw:text-lg tw:font-bold tw:text-on-sidebar">Basic Information</h2>
          </div>
          <div class="tw:p-6 tw:grid tw:grid-cols-2 tw:gap-6">
            <div>
              <p class="tw:text-secondary tw:mb-1">Document Prefix</p>
              <p class="tw:font-mono tw:font-bold tw:text-on-sidebar">{{ template.prefix }}</p>
            </div>
            <div>
              <p class="tw:text-secondary tw:mb-1">Department</p>
              <DepartmentBadgeById
                v-if="template.departmentId"
                :departmentId="template.departmentId"
              />
              <span v-else class="tw:text-sm tw:text-secondary">—</span>
            </div>
            <div>
              <p class="tw:text-secondary tw:mb-1">Related Standard</p>
              <RelatedStandardBadgeById
                v-if="template.relatedStandardId"
                :relatedStandardId="template.relatedStandardId"
              />
              <span v-else class="tw:text-sm tw:text-secondary">—</span>
            </div>
            <div>
              <p class="tw:text-secondary tw:mb-1">Status</p>
              <DocumentTemplateStatusSelectMenu
                v-if="canUpdate"
                v-model="template.statusId"
                :required="true"
              />
              <DocumentTemplateStatusBadgeById v-else :statusId="template.statusId" />
            </div>
            <div>
              <p class="tw:text-secondary tw:mb-1">Created Date</p>
              <p class="tw:text-on-sidebar">{{ template.createdAt?.formatDate('date') }}</p>
            </div>
            <div>
              <p class="tw:text-secondary tw:mb-1">Last Modified</p>
              <p class="tw:text-on-sidebar">{{ template.updatedAt?.formatDate('date') }}</p>
            </div>
          </div>
        </div>

        <!-- Default Settings Card -->
        <div class="tw:bg-sidebar tw:rounded-xl tw:border tw:border-divider tw:overflow-hidden">
          <div
            class="tw:px-6 tw:py-4 tw:border-b tw:border-divider tw:bg-main-hover tw:flex tw:items-center tw:gap-2"
          >
            <IconSettings :size="22" class="tw:text-primary" />
            <h2 class="tw:text-lg tw:font-bold tw:text-on-sidebar">Default Settings</h2>
          </div>
          <div class="tw:p-6 tw:grid tw:grid-cols-2 tw:md:grid-cols-3 tw:gap-6">
            <div>
              <p class="tw:text-secondary tw:mb-1">Training Available</p>
              <BaseCheckbox v-if="canUpdate" v-model="template.trainingAvailable" label="Yes" />
              <template v-else>
                <div class="tw:flex tw:items-center tw:gap-2">
                  <IconCircleCheck
                    v-if="template.trainingAvailable"
                    :size="20"
                    class="tw:text-green-600"
                  />
                  <IconCircleX v-else :size="20" class="tw:text-gray-400" />
                  <span>{{ template.trainingAvailable ? 'Yes' : 'No' }}</span>
                </div>
              </template>
            </div>
            <div>
              <p class="tw:text-secondary tw:mb-1">Retraining on Version</p>
              <BaseCheckbox v-if="canUpdate" v-model="template.retrainingOnVersion" label="Yes" />
              <template v-else>
                <div class="tw:flex tw:items-center tw:gap-2">
                  <IconCircleCheck
                    v-if="template.retrainingOnVersion"
                    :size="20"
                    class="tw:text-green-600"
                  />
                  <IconCircleX v-else :size="20" class="tw:text-gray-400" />
                  <span>{{ template.retrainingOnVersion ? 'Yes' : 'No' }}</span>
                </div>
              </template>
            </div>
            <div>
              <p class="tw:text-secondary tw:mb-1">Periodic Review</p>
              <BaseTextInput
                v-if="canUpdate"
                v-model="template.periodicReviewMonths"
                type="number"
                placeholder="Months"
              />
              <p v-else class="tw:text-on-sidebar">{{ template.periodicReviewMonths }} months</p>
            </div>
            <div>
              <p class="tw:text-secondary tw:mb-1">Review Limit</p>
              <BaseTextInput
                v-if="canUpdate"
                v-model="template.reviewLimitDays"
                type="number"
                placeholder="Days"
              />
              <p v-else class="tw:text-on-sidebar">{{ template.reviewLimitDays }} days</p>
            </div>
            <div>
              <p class="tw:text-secondary tw:mb-1">Approval Limit</p>
              <BaseTextInput
                v-if="canUpdate"
                v-model="template.approvalLimitDays"
                type="number"
                placeholder="Days"
              />
              <p v-else class="tw:text-on-sidebar">{{ template.approvalLimitDays }} days</p>
            </div>
            <div>
              <p class="tw:text-secondary tw:mb-1">Auto Effective</p>
              <BaseCheckbox
                v-if="canUpdate"
                v-model="template.autoEffectiveOnApproval"
                label="Yes"
              />
              <template v-else>
                <div class="tw:flex tw:items-center tw:gap-2">
                  <IconCircleCheck
                    v-if="template.autoEffectiveOnApproval"
                    :size="20"
                    class="tw:text-green-600"
                  />
                  <IconCircleX v-else :size="20" class="tw:text-gray-400" />
                  <span>{{ template.autoEffectiveOnApproval ? 'Yes' : 'No' }}</span>
                </div>
              </template>
            </div>
            <div>
              <p class="tw:text-secondary tw:mb-1">Show Section Titles</p>
              <BaseCheckbox v-if="canUpdate" v-model="template.showSectionTitles" label="Yes" />
              <template v-else>
                <div class="tw:flex tw:items-center tw:gap-2">
                  <IconCircleCheck
                    v-if="template.showSectionTitles"
                    :size="20"
                    class="tw:text-green-600"
                  />
                  <IconCircleX v-else :size="20" class="tw:text-gray-400" />
                  <span>{{ template.showSectionTitles ? 'Yes' : 'No' }}</span>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- Sections Preview Card -->
        <div class="tw:bg-sidebar tw:rounded-xl tw:border tw:border-divider tw:overflow-hidden">
          <div
            class="tw:px-6 tw:py-4 tw:border-b tw:border-divider tw:bg-main-hover tw:flex tw:items-center tw:gap-2"
          >
            <IconLayoutList :size="22" class="tw:text-primary" />
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
                <span
                  class="tw:inline-flex tw:items-center tw:rounded tw:px-3 tw:py-1 tw:text-xs tw:font-medium"
                  :class="
                    SECTION_TYPE_MAP[section.sectionType]?.class ||
                    'tw:bg-gray-100 tw:text-gray-600'
                  "
                >
                  {{
                    (
                      SECTION_TYPE_MAP[section.sectionType]?.label ||
                      section.sectionType ||
                      '—'
                    ).toUpperCase()
                  }}
                </span>
              </div>
            </div>
            <div v-else class="tw:text-center tw:py-8 tw:text-secondary">
              No sections defined for this template.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="tw:flex tw:flex-col tw:items-center tw:justify-center tw:h-full tw:gap-4">
      <div class="tw:text-xl tw:text-secondary">Template not found</div>
      <button
        class="tw:flex tw:items-center tw:gap-2 tw:px-4 tw:py-2 tw:rounded-lg tw:border tw:border-divider tw:text-sm tw:font-medium tw:hover:bg-main-hover tw:transition-colors"
        @click="goBack"
      >
        <IconArrowLeft :size="16" />
        Go Back
      </button>
    </div>
  </div>
</template>

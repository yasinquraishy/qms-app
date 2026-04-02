<script setup>
const props = defineProps({
  document: {
    type: Object,
    required: true,
  },
  currentVersion: {
    type: Object,
    default: null,
  },
  canEdit: {
    type: Boolean,
    default: false,
  },
})

// State
const activeSection = ref(null)

// Computed properties
const documentSections = computed(() => {
  return props.currentVersion?.sections || []
})

const formattedEffectiveDate = computed(() => {
  return props.currentVersion?.effectiveDate?.formatDate('date')
})

// Section methods
function scrollToSection(sectionId) {
  const element = window.document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
    activeSection.value = sectionId
  }
}
</script>

<template>
  <div class="tw:lg:col-span-1 tw:space-y-6 tw:print:hidden">
    <div class="tw:sticky tw:top-24 tw:space-y-6">
      <!-- Properties Card -->
      <div class="tw:bg-sidebar tw:rounded-xl tw:shadow-sm tw:border tw:border-divider tw:p-5">
        <h4 class="ds-label tw:text-secondary tw:mb-4 tw:flex tw:items-center tw:justify-between">
          Properties
          <WIcon name="settings" size="16px" />
        </h4>
        <div class="tw:space-y-4">
          <div>
            <label class="ds-label"> Document ID </label>
            <p class="tw:text-sm tw:font-semibold tw:text-on-sidebar">
              {{ document.docNumber }}
            </p>
          </div>

          <div v-if="document.user" class="tw:flex tw:items-center tw:gap-3">
            <div
              class="tw:h-8 tw:w-8 tw:rounded-full tw:bg-main-hover tw:flex tw:items-center tw:justify-center tw:shrink-0"
            >
              <WIcon name="person" class="tw:text-secondary" size="16px" />
            </div>
            <div>
              <label class="ds-label"> Owner </label>
              <p class="tw:text-sm tw:font-medium">
                {{ document.user.firstName }} {{ document.user.lastName }}
              </p>
            </div>
          </div>

          <div class="tw:grid tw:grid-cols-2 tw:gap-4">
            <div>
              <label class="ds-label"> Type </label>
              <p class="tw:text-sm tw:font-medium">
                {{ document.template?.name || 'Document' }}
              </p>
            </div>
            <div>
              <label class="ds-label"> Status </label>
              <p class="tw:text-sm tw:font-bold tw:text-green-600">
                {{ currentVersion?.status?.name || '-' }}
              </p>
            </div>
          </div>

          <div v-if="document.department">
            <label class="ds-label"> Department </label>
            <p class="tw:text-sm tw:font-medium">
              {{ document.department.name }}
            </p>
          </div>

          <div v-if="document.relatedStandard">
            <label class="ds-label"> Related Standard </label>
            <p class="tw:text-sm tw:font-medium">
              {{ document.relatedStandard.name }}
            </p>
          </div>

          <div>
            <label class="ds-label"> Periodic Review </label>
            <p class="tw:text-sm tw:font-medium">{{ document.periodicReviewMonths }} months</p>
          </div>

          <div>
            <label class="ds-label"> Auto-Effective </label>
            <p class="tw:text-sm tw:font-medium">
              {{ document.autoEffectiveOnApproval ? 'Yes' : 'No' }}
            </p>
          </div>

          <div>
            <label class="ds-label"> Effective Date </label>
            <p class="tw:text-sm tw:font-medium">
              {{ formattedEffectiveDate }}
            </p>
          </div>

          <!-- Collaborators Section -->
          <DocumentsCollaborators
            v-model:collaborators="document.collaborators"
            :documentId="document.id"
            :canEdit="canEdit"
          />

          <!-- Approvers Section -->
          <div v-if="document.approvers?.length > 0" class="tw:pt-4 tw:border-t tw:border-divider">
            <label class="ds-label tw:mb-2 tw:block"> Approvers </label>
            <div class="tw:flex tw:-space-x-2">
              <div
                v-for="user in document.approvers.slice(0, 4)"
                :key="user.id"
                class="tw:w-8 tw:h-8 tw:rounded-full tw:border-2 tw:border-sidebar tw:bg-main-hover tw:flex tw:items-center tw:justify-center"
                :title="`${user.firstName} ${user.lastName}`"
              >
                <span class="tw:text-[10px] tw:font-bold">
                  {{ user.firstName[0] }}{{ user.lastName[0] }}
                </span>
              </div>
              <div
                v-if="document.approvers.length > 4"
                class="tw:w-8 tw:h-8 tw:rounded-full tw:border-2 tw:border-sidebar tw:bg-primary tw:flex tw:items-center tw:justify-center tw:text-white"
              >
                <span class="tw:text-[10px] tw:font-bold">
                  +{{ document.approvers.length - 4 }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Metadata Tags Card -->
      <div class="tw:bg-sidebar tw:rounded-xl tw:shadow-sm tw:border tw:border-divider tw:p-5">
        <h4 class="ds-label tw:text-secondary tw:mb-4">Metadata Tags</h4>
        <div class="tw:flex tw:flex-wrap tw:gap-2">
          <span
            class="tw:px-2 tw:py-1 tw:bg-main-hover tw:text-secondary tw:rounded-md tw:text-[11px] tw:font-semibold tw:border tw:border-divider"
          >
            All Employees
          </span>
          <span
            class="tw:px-2 tw:py-1 tw:bg-primary/10 tw:text-primary tw:rounded-md tw:text-[11px] tw:font-semibold tw:border tw:border-primary/20"
          >
            Change Control
          </span>
          <span
            class="tw:px-2 tw:py-1 tw:bg-main-hover tw:text-secondary tw:rounded-md tw:text-[11px] tw:font-semibold tw:border tw:border-divider"
          >
            Document Control
          </span>
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

<script setup>
const selectedVersionId = defineModel({
  type: [String, Number, null],
  default: null,
})

const { workflows, loading, fetchWorkflows, fetchVersionById } = useApprovalWorkflows()

const extraWorkflows = ref([])

const activeWorkflows = computed(() => {
  const active = workflows.value.filter(
    (w) => w.statusId === 'ACTIVE' && w.currentVersion.statusId === 'PUBLISHED',
  )
  return [...active, ...extraWorkflows.value].filter((w) => w.currentVersion)
})

const selectedWorkflow = computed(() =>
  activeWorkflows.value.find((w) => w.currentVersion?.id === selectedVersionId.value),
)

function pickWorkflow(workflow) {
  const version = workflow.currentVersion
  if (!version) return
  selectedVersionId.value = version.id
}

function versionLabel(version) {
  return `v${version.versionLabel || `${version.versionMajor}.${version.versionMinor}`}`
}

function totalReviewers(version) {
  if (!version.steps?.length) return 0
  const ids = new Set()
  version.steps.forEach((step) => {
    step.reviewers?.forEach((r) => ids.add(r.id))
    step.roles?.forEach((r) => {
      r.users?.forEach((u) => ids.add(u.id))
    })
  })
  return ids.size
}

onMounted(async () => {
  await fetchWorkflows()

  if (selectedVersionId.value && !selectedWorkflow.value) {
    const { version } = await fetchVersionById(selectedVersionId.value)
    if (version?.workflow) {
      extraWorkflows.value.push({
        ...version.workflow,
        currentVersion: version,
      })
    }
  }
})
</script>

<template>
  <div class="tw:space-y-3">
    <!-- Loading -->
    <div v-if="loading" class="tw:text-center tw:py-8">
      <QSpinner color="primary" size="24px" />
      <p class="tw:text-sm tw:text-secondary tw:mt-2">Loading workflows...</p>
    </div>

    <!-- Empty state -->
    <WEmptyState
      v-else-if="activeWorkflows.length === 0"
      icon="account_tree"
      title="No active workflows available"
      compact
    />

    <!-- Workflow list -->
    <div v-else class="tw:grid tw:grid-cols-1 tw:gap-2">
      <div
        v-for="workflow in activeWorkflows"
        :key="workflow.id"
        class="tw:w-full tw:flex tw:items-center tw:justify-between tw:p-4 tw:rounded-xl tw:border-2 tw:cursor-pointer tw:transition-all tw:group"
        :class="
          selectedVersionId === workflow.currentVersion?.id
            ? 'tw:border-primary tw:bg-primary/5'
            : 'tw:border-divider tw:bg-sidebar tw:hover:border-primary/50 tw:hover:bg-sidebar-hover'
        "
        @click="pickWorkflow(workflow)"
      >
        <div class="tw:flex tw:items-center tw:gap-3">
          <div
            class="tw:h-9 tw:w-9 tw:rounded-lg tw:flex tw:items-center tw:justify-center tw:shrink-0"
            :class="
              selectedVersionId === workflow.currentVersion?.id
                ? 'tw:bg-primary/10 tw:text-primary'
                : 'tw:bg-sidebar-hover tw:text-secondary tw:group-hover:bg-primary/10 tw:group-hover:text-primary'
            "
          >
            <WIcon name="account_tree" size="20px" />
          </div>
          <div>
            <p
              class="tw:font-bold tw:text-sm tw:text-on-sidebar tw:group-hover:text-primary tw:transition-colors"
              :class="{ 'tw:text-primary': selectedVersionId === workflow.currentVersion?.id }"
            >
              {{ workflow.name }}
            </p>
            <p v-if="workflow.description" class="tw:text-xs tw:text-secondary tw:line-clamp-1">
              {{ workflow.description }}
            </p>
            <p v-if="workflow.currentVersion" class="tw:text-xs tw:text-secondary">
              {{ versionLabel(workflow.currentVersion) }}
            </p>
          </div>
        </div>
        <div class="tw:flex tw:items-center tw:gap-2 tw:shrink-0">
          <template v-if="workflow.currentVersion">
            <span
              v-if="workflow.currentVersion.steps?.length"
              class="tw:bg-sidebar-hover tw:px-2 tw:py-1 tw:rounded tw:text-[10px] tw:font-bold tw:text-secondary tw:flex tw:items-center tw:gap-1"
            >
              <WIcon name="list_alt" size="12px" />
              {{ workflow.currentVersion.steps.length }} Steps
            </span>
            <span
              class="tw:bg-sidebar-hover tw:px-2 tw:py-1 tw:rounded tw:text-[10px] tw:font-bold tw:text-secondary tw:flex tw:items-center tw:gap-1"
            >
              <WIcon name="group" size="12px" />
              {{ totalReviewers(workflow.currentVersion) }} Reviewers
            </span>
          </template>
          <span
            v-if="selectedVersionId === workflow.currentVersion?.id"
            class="ds-label-sm tw:px-2 tw:py-0.5 tw:bg-primary tw:text-white tw:rounded"
          >
            Selected
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

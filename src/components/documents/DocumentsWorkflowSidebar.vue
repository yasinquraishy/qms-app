<script setup>
import { useApprovalWorkflowInstances } from '@/composables/useApprovalWorkflowInstances.js'

const props = defineProps({
  instanceId: { type: String, default: null },
})

const show = defineModel({ type: Boolean, default: false })

const { fetchInstance } = useApprovalWorkflowInstances()

const workflowInstance = ref(null)
const loading = ref(false)

async function load() {
  if (!props.instanceId) return
  loading.value = true
  try {
    const result = await fetchInstance(props.instanceId, { includeReviewers: true })
    workflowInstance.value = result.workflowInstance || null
  } finally {
    loading.value = false
  }
}

watch(
  () => show.value,
  (val) => {
    if (val && props.instanceId) load()
  },
)

watch(
  () => props.instanceId,
  (val) => {
    if (show.value && val) load()
    else workflowInstance.value = null
  },
)
</script>

<template>
  <Teleport to="body">
    <Transition name="sidebar-fade">
      <div
        v-if="show"
        class="tw:fixed tw:inset-0 tw:z-50 tw:flex tw:justify-end"
        @click.self="show = false"
      >
        <!-- Backdrop -->
        <div class="tw:absolute tw:inset-0 tw:bg-black/40" @click="show = false" />

        <!-- Panel -->
        <Transition name="sidebar-slide">
          <aside
            v-if="show"
            class="tw:relative tw:w-105 tw:max-w-full tw:bg-sidebar tw:border-l tw:border-divider tw:shadow-2xl tw:flex! tw:flex-col tw:h-full tw:overflow-auto"
          >
            <!-- Header -->
            <div
              class="tw:flex tw:items-center tw:justify-between tw:px-5 tw:py-4 tw:border-b tw:border-divider tw:shrink-0"
            >
              <h2 class="tw:text-base tw:font-bold tw:text-on-main">Approval Workflow</h2>
              <WBtn flat round dense @click="show = false">
                <WIcon name="close" size="20px" />
              </WBtn>
            </div>

            <!-- Content -->
            <div class="tw:flex-1 tw:overflow-y-auto tw:p-5">
              <div v-if="loading" class="tw:flex tw:justify-center tw:py-12">
                <QSpinner color="primary" size="36px" />
              </div>
              <WEmptyState
                v-else-if="!workflowInstance"
                icon="account_tree"
                title="No workflow data available"
                compact
              />
              <ApprovalWorkflowInstanceTimeline v-else :steps="workflowInstance.steps || []" />
            </div>
          </aside>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.sidebar-fade-enter-active,
.sidebar-fade-leave-active {
  transition: opacity 0.2s ease;
}
.sidebar-fade-enter-from,
.sidebar-fade-leave-to {
  opacity: 0;
}

.sidebar-slide-enter-active,
.sidebar-slide-leave-active {
  transition: transform 0.25s ease;
}
.sidebar-slide-enter-from,
.sidebar-slide-leave-to {
  transform: translateX(100%);
}
</style>

<script setup>
import { currentSession } from '@/utils/currentSession.js'
import { getCompanyPath } from '@/utils/routeHelpers'

const props = defineProps({
  instance: { type: Object, required: true },
})

const emit = defineEmits(['close', 'done'])

// ─── Computed ────────────────────────────────────────────────────────────────
const currentUserId = computed(() => currentSession.value?.id)
const doc = computed(() => props.instance.resource)

const activeStep = computed(
  () => props.instance.steps?.find((s) => s.statusId === 'IN_PROGRESS') || null,
)

const myTask = computed(() =>
  activeStep.value?.tasks?.find((t) => (t.assignedTo || t.assignee?.id) === currentUserId.value),
)

const canActOnStep = computed(() => myTask.value?.statusId === 'ASSIGNED')
</script>

<template>
  <div
    class="tw:w-112.5 tw:shrink-0 tw:bg-sidebar tw:border tw:border-divider tw:rounded-xl tw:shadow-lg tw:flex tw:flex-col tw:overflow-hidden"
  >
    <!--Header-->
    <div class="tw:p-5 tw:border-b tw:border-divider tw:flex tw:justify-between tw:items-start">
      <div class="tw:flex-1 tw:min-w-0 tw:pr-3">
        <div class="tw:flex tw:items-center tw:gap-2 tw:mb-1">
          <span class="ds-label-sm tw:text-primary tw:bg-primary/10 tw:px-2 tw:py-0.5 tw:rounded">
            Current Task
          </span>
          <span class="ds-label-sm tw:text-secondary tw:font-mono">
            {{ doc?.docNumber || instance.id.slice(0, 8) }}
          </span>
        </div>
        <h3 class="tw:text-base tw:font-bold tw:text-on-main tw:truncate">
          {{ doc?.title || '—' }}
        </h3>
        <p class="tw:text-xs tw:text-secondary tw:mt-1">
          {{ instance.workflowVersion?.workflow?.name || '—' }} &bull;
          {{ doc?.documentType?.name || '—' }}
        </p>
      </div>
      <WBtn
        flat
        round
        dense
        icon="open_in_new"
        color="grey-6"
        :to="getCompanyPath(`/workflow-instances/${instance.id}`)"
      />

      <WBtn flat round dense icon="close" color="grey-6" @click="emit('close')" />
    </div>

    <!--body-->
    <div class="tw:flex-1 tw:overflow-y-auto">
      <DocumentsMainContentLeft
        v-if="doc"
        :document="doc"
        :currentVersion="doc.latestVersion"
        :canEdit="false"
        :dense="true"
        :reviewMode="canActOnStep"
      />
    </div>

    <!-- Footer -->
    <div class="tw:p-2 tw:border-t tw:border-divider tw:bg-background">
      <template v-if="canActOnStep">
        <div class="tw:grid tw:grid-cols-2 tw:gap-2">
          <ApprovalWorkflowInstanceApproverAction
            action="APPROVE"
            :activeStep="activeStep"
            @done="emit('done')"
          />
          <ApprovalWorkflowInstanceApproverAction
            action="REJECT"
            :activeStep="activeStep"
            @done="emit('done')"
          />
        </div>
      </template>
      <div v-else class="tw:text-center tw:text-sm tw:text-secondary tw:py-2">
        No action required from you on this step.
      </div>
    </div>
  </div>
</template>

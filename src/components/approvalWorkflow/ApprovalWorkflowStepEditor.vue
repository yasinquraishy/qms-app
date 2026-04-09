<script setup>
import { useDebounceFn } from '@vueuse/core'
import { IconNote, IconUsers, IconInfoCircle, IconAlertCircle } from '@tabler/icons-vue'

const props = defineProps({
  step: { type: Object, required: true },
  canUpdate: { type: Boolean, default: false },
})

const debouncedStepSave = useDebounceFn(async () => {
  if (!props.step || !props.canUpdate) return
  await props.step.save()
}, 800)

let lastStepId = null
watch(
  () => props.step,
  (s) => {
    if (!props.canUpdate) return
    if (s?.id !== lastStepId) {
      lastStepId = s?.id
      return
    }
    debouncedStepSave()
  },
  { deep: true },
)

// Step roles and step users counts for warning/error callouts
const stepRoles = useLiveQueryWithDeps(
  [() => props.step?.id],
  async (db, [stepId]) => {
    if (!stepId) return []
    return await db.ApprovalWorkflowStepRole.where('stepId', stepId).exec()
  },
  { initial: [] },
)

const stepUsers = useLiveQueryWithDeps(
  [() => props.step?.id],
  async (db, [stepId]) => {
    if (!stepId) return []
    return await db.ApprovalWorkflowStepUser.where('stepId', stepId).exec()
  },
  { initial: [] },
)

const roleIds = computed(() => stepRoles.value.map((sr) => sr.roleId))
const reviewerIds = computed(() => stepUsers.value.map((su) => su.userId))

const approverTab = ref('roles')
</script>

<template>
  <div class="tw:space-y-10">
    <!-- Step Details -->
    <div class="tw:space-y-6">
      <div class="tw:flex tw:items-center tw:gap-2 tw:text-secondary tw:mb-2">
        <IconNote :size="22" />
        <h2 class="tw:text-lg tw:font-bold tw:text-on-main">Step Configuration: {{ step.name }}</h2>
      </div>

      <div class="tw:grid tw:grid-cols-1 tw:md:grid-cols-2 tw:gap-6">
        <!-- Left Column -->
        <div class="tw:space-y-4">
          <div>
            <label class="tw:block tw:text-xs tw:font-bold tw:text-secondary tw:uppercase tw:mb-2">
              Step Name
            </label>
            <BaseTextInput
              v-model="step.name"
              name="name"
              placeholder="e.g. Peer Review"
              :disabled="!canUpdate"
            />
          </div>
          <div>
            <label class="tw:block tw:text-xs tw:font-bold tw:text-secondary tw:uppercase tw:mb-2">
              Description
            </label>
            <BaseTextarea
              v-model="step.description"
              placeholder="Describe what happens at this step..."
              :disabled="!canUpdate"
            />
          </div>
        </div>

        <!-- Right Column -->
        <div class="tw:space-y-6">
          <!-- Approval Rule -->
          <div>
            <label class="tw:block tw:text-xs tw:font-bold tw:text-secondary tw:uppercase tw:mb-3">
              Approval Rule
            </label>
            <div class="tw:grid tw:grid-cols-2 tw:gap-3">
              <label
                class="tw:relative tw:flex tw:flex-col tw:p-4 tw:border tw:rounded-xl tw:cursor-pointer tw:transition-all"
                :class="
                  step.approvalRule === 'ALL'
                    ? 'tw:border-primary tw:bg-primary/5 tw:ring-1 tw:ring-primary/20'
                    : 'tw:border-divider tw:hover:bg-main-hover'
                "
              >
                <input
                  v-model="step.approvalRule"
                  type="radio"
                  value="ALL"
                  class="tw:sr-only"
                  :disabled="!canUpdate"
                />
                <span
                  class="tw:text-xs tw:font-bold tw:mb-1"
                  :class="step.approvalRule === 'ALL' ? 'tw:text-primary' : 'tw:text-on-main'"
                >
                  ALL
                </span>
                <span class="tw:text-[10px] tw:leading-tight tw:text-secondary">
                  All assigned approvers must approve to advance.
                </span>
              </label>
              <label
                class="tw:relative tw:flex tw:flex-col tw:p-4 tw:border tw:rounded-xl tw:cursor-pointer tw:transition-all"
                :class="
                  step.approvalRule === 'ANY'
                    ? 'tw:border-primary tw:bg-primary/5 tw:ring-1 tw:ring-primary/20'
                    : 'tw:border-divider tw:hover:bg-main-hover'
                "
              >
                <input
                  v-model="step.approvalRule"
                  type="radio"
                  value="ANY"
                  class="tw:sr-only"
                  :disabled="!canUpdate"
                />
                <span
                  class="tw:text-xs tw:font-bold tw:mb-1"
                  :class="step.approvalRule === 'ANY' ? 'tw:text-primary' : 'tw:text-on-main'"
                >
                  ANY
                </span>
                <span class="tw:text-[10px] tw:leading-tight tw:text-secondary">
                  Only one approver needs to sign to advance.
                </span>
              </label>
            </div>
          </div>

          <!-- SLA Days -->
          <div>
            <label class="tw:block tw:text-xs tw:font-bold tw:text-secondary tw:uppercase tw:mb-2">
              SLA: Due in (days)
            </label>
            <div class="tw:flex tw:items-center tw:gap-2">
              <BaseTextInput
                v-model="step.slaDays"
                type="number"
                placeholder="e.g. 5"
                :disabled="!canUpdate"
                inputClass="tw:w-24"
                :min="1"
              />
              <span class="tw:text-xs tw:font-medium tw:text-secondary">
                Business days from activation
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Compliance Controls -->
    <div
      class="tw:grid tw:grid-cols-2 tw:gap-4 tw:p-6 tw:bg-main-hover tw:rounded-2xl tw:border tw:border-divider"
    >
      <label class="tw:flex tw:items-center tw:gap-3 tw:cursor-pointer">
        <BaseCheckbox v-model="step.requireComments" :disabled="!canUpdate" />
        <span class="tw:text-xs tw:font-semibold tw:text-on-main">Require Comments</span>
      </label>
      <label class="tw:flex tw:items-center tw:gap-3 tw:cursor-pointer">
        <BaseCheckbox v-model="step.requireEsignature" :disabled="!canUpdate" />
        <span class="tw:text-xs tw:font-semibold tw:text-on-main">Require E-signature</span>
      </label>
    </div>

    <!-- Step Approvers -->
    <div class="tw:space-y-4">
      <div class="tw:flex tw:items-center tw:justify-between">
        <div class="tw:flex tw:items-center tw:gap-2 tw:text-secondary">
          <IconUsers :size="22" />
          <h2 class="tw:text-lg tw:font-bold tw:text-on-main">Step Approvers</h2>
        </div>
      </div>

      <!-- Warning Callout -->
      <div
        v-if="roleIds.length > 0 && reviewerIds.length > 0"
        class="tw:bg-warning/10 tw:border tw:border-warning/30 tw:p-4 tw:rounded-xl tw:flex tw:gap-3"
      >
        <IconInfoCircle :size="20" class="tw:text-warning tw:shrink-0" />
        <div class="tw:text-xs tw:text-warning">
          <p class="tw:font-bold tw:mb-0.5">Union Selection Logic</p>
          <p>
            Selecting both roles and individual users will result in a
            <strong>union</strong> of all participants being assigned to this step.
          </p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tw:border tw:border-divider tw:rounded-xl tw:overflow-hidden">
        <div class="tw:flex tw:border-b tw:border-divider tw:bg-main-hover">
          <button
            class="tw:px-6 tw:py-3 tw:text-xs tw:font-bold tw:transition-colors"
            :class="
              approverTab === 'roles'
                ? 'tw:text-primary tw:border-b-2 tw:border-primary tw:bg-main'
                : 'tw:text-secondary tw:hover:text-on-main'
            "
            @click="approverTab = 'roles'"
          >
            BY ROLE
          </button>
          <button
            class="tw:px-6 tw:py-3 tw:text-xs tw:font-bold tw:transition-colors"
            :class="
              approverTab === 'users'
                ? 'tw:text-primary tw:border-b-2 tw:border-primary tw:bg-main'
                : 'tw:text-secondary tw:hover:text-on-main'
            "
            @click="approverTab = 'users'"
          >
            BY USERS
          </button>
        </div>

        <div class="tw:p-6">
          <ApprovalWorkflowRoleSelector
            v-show="approverTab === 'roles'"
            :stepId="step.id"
            :canUpdate="canUpdate"
          />
          <ApprovalWorkflowUserSelector
            v-show="approverTab === 'users'"
            :stepId="step.id"
            :canUpdate="canUpdate"
          />
        </div>
      </div>

      <!-- Approver Error -->
      <div
        v-if="roleIds.length === 0 && reviewerIds.length === 0"
        class="tw:flex tw:items-center tw:gap-2 tw:text-bad tw:px-1"
      >
        <IconAlertCircle :size="14" class="tw:text-bad" />
        <span class="ds-label-sm"> At least one approver must be selected for this step </span>
      </div>
    </div>
  </div>
</template>

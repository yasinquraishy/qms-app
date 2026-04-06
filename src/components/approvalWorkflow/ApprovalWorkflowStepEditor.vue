<script setup>
import { required, helpers } from '@vuelidate/validators'
import { useValidator } from '@shared/composables/validator.js'

defineProps({
  canUpdate: { type: Boolean, default: false },
})

const step = defineModel('step', { type: Object, required: true })

const stepRules = computed(() => ({
  name: { required: helpers.withMessage('Required', required) },
}))

useValidator(stepRules, step)

const approverTab = ref('roles')
</script>

<template>
  <div class="tw:space-y-10">
    <!-- Step Details -->
    <div class="tw:space-y-6">
      <div class="tw:flex tw:items-center tw:gap-2 tw:text-secondary tw:mb-2">
        <WIcon icon="edit_note" size="22px" />
        <h2 class="tw:text-lg tw:font-bold tw:text-on-main">Step Configuration: {{ step.name }}</h2>
      </div>

      <div class="tw:grid tw:grid-cols-1 tw:md:grid-cols-2 tw:gap-6">
        <!-- Left Column -->
        <div class="tw:space-y-4">
          <div>
            <label class="tw:block tw:text-xs tw:font-bold tw:text-secondary tw:uppercase tw:mb-2">
              Step Name
            </label>
            <WInput
              v-model="step.name"
              name="name"
              placeholder="e.g. Peer Review"
              dense
              :readonly="!canUpdate"
            />
          </div>
          <div>
            <label class="tw:block tw:text-xs tw:font-bold tw:text-secondary tw:uppercase tw:mb-2">
              Description
            </label>
            <WInput
              v-model="step.description"
              type="textarea"
              placeholder="Describe what happens at this step..."
              dense
              :readonly="!canUpdate"
              rows="3"
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
              <WInput
                v-model.number="step.slaDays"
                type="number"
                placeholder="e.g. 5"
                dense
                :readonly="!canUpdate"
                class="tw:w-24"
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
        <QCheckbox v-model="step.requireComments" color="primary" dense :disable="!canUpdate" />
        <span class="tw:text-xs tw:font-semibold tw:text-on-main">Require Comments</span>
      </label>
      <label class="tw:flex tw:items-center tw:gap-3 tw:cursor-pointer">
        <QCheckbox v-model="step.requireEsignature" color="primary" dense :disable="!canUpdate" />
        <span class="tw:text-xs tw:font-semibold tw:text-on-main">Require E-signature</span>
      </label>
    </div>

    <!-- Step Approvers -->
    <div class="tw:space-y-4">
      <div class="tw:flex tw:items-center tw:justify-between">
        <div class="tw:flex tw:items-center tw:gap-2 tw:text-secondary">
          <WIcon icon="group_add" size="22px" />
          <h2 class="tw:text-lg tw:font-bold tw:text-on-main">Step Approvers</h2>
        </div>
      </div>

      <!-- Warning Callout -->
      <div
        v-if="step.roleIds?.length > 0 && step.reviewerIds?.length > 0"
        class="tw:bg-warning/10 tw:border tw:border-warning/30 tw:p-4 tw:rounded-xl tw:flex tw:gap-3"
      >
        <WIcon icon="info" size="20px" class="tw:text-warning tw:shrink-0" />
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
            v-model:roleIds="step.roleIds"
            :canUpdate="canUpdate"
          />
          <ApprovalWorkflowUserSelector
            v-show="approverTab === 'users'"
            v-model:reviewerIds="step.reviewerIds"
            :canUpdate="canUpdate"
          />
        </div>
      </div>

      <!-- Approver Error -->
      <div
        v-if="step.roleIds?.length === 0 && step.reviewerIds?.length === 0"
        class="tw:flex tw:items-center tw:gap-2 tw:text-bad tw:px-1"
      >
        <WIcon icon="error_outline" size="14px" />
        <span class="ds-label-sm"> At least one approver must be selected for this step </span>
      </div>
    </div>
  </div>
</template>

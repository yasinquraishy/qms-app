<script setup>
const model = defineModel({ type: Object, required: true })

const approvalRuleOptions = [
  { label: 'ALL — every approver must approve', value: 'ALL' },
  { label: 'ANY — one approver is sufficient', value: 'ANY' },
]
</script>

<template>
  <div
    class="tw:rounded-xl tw:border tw:border-divider tw:shadow-sm tw:overflow-hidden tw:bg-sidebar"
  >
    <!-- Card Header -->
    <div class="tw:px-6 tw:py-4 tw:border-b tw:border-divider tw:bg-main-hover">
      <h2 class="tw:text-lg tw:font-bold tw:text-on-sidebar">Default Settings</h2>
    </div>

    <!-- Card Content -->
    <div class="tw:p-6 tw:flex tw:flex-col tw:gap-8">
      <!-- Approval Workflow Defaults -->
      <div class="tw:flex tw:flex-col tw:gap-5">
        <h3 class="tw:text-xs tw:font-bold tw:uppercase tw:tracking-widest tw:text-secondary">
          Approval Workflow Defaults
        </h3>

        <div class="tw:grid tw:grid-cols-1 tw:md:grid-cols-2 tw:gap-6">
          <BaseTextInput
            v-model.number="model.settings.defaultSla"
            label="Default SLA (days)"
            type="number"
            hint="Applied to new workflow steps"
          />
          <div class="tw:flex tw:flex-col tw:gap-1">
            <label class="tw:text-sm tw:font-medium tw:text-secondary">Default Approval Rule</label>
            <select
              v-model="model.settings.defaultWorkflowApprovalRule"
              class="tw:w-full tw:px-3 tw:py-2 tw:text-sm tw:rounded-lg tw:border tw:border-divider tw:bg-main tw:text-on-main tw:focus:outline-none tw:focus:ring-2 tw:focus:ring-primary"
            >
              <option v-for="opt in approvalRuleOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
            <p class="tw:text-xs tw:text-secondary">ALL or ANY approvers required</p>
          </div>
        </div>

        <div class="tw:flex tw:flex-col tw:gap-4">
          <div class="tw:flex tw:items-center tw:justify-between">
            <div>
              <div class="tw:text-sm tw:font-medium tw:text-on-sidebar">
                Require Signature by Default
              </div>
              <div class="tw:text-xs tw:text-secondary">Workflow steps require an e-signature</div>
            </div>
            <BaseSwitch v-model="model.settings.defaultWorkflowRequireSignature" />
          </div>
          <div class="tw:flex tw:items-center tw:justify-between">
            <div>
              <div class="tw:text-sm tw:font-medium tw:text-on-sidebar">
                Require Comment by Default
              </div>
              <div class="tw:text-xs tw:text-secondary">Workflow steps require a comment</div>
            </div>
            <BaseSwitch v-model="model.settings.defaultWorkflowRequireComment" />
          </div>
        </div>
      </div>

      <hr class="tw:border-divider" />

      <!-- Document Template Defaults -->
      <div class="tw:flex tw:flex-col tw:gap-5">
        <h3 class="tw:text-xs tw:font-bold tw:uppercase tw:tracking-widest tw:text-secondary">
          Document Template Defaults
        </h3>

        <div class="tw:grid tw:grid-cols-1 tw:md:grid-cols-3 tw:gap-6">
          <BaseTextInput
            v-model.number="model.settings.defaultDocumentTemplatePeriodicReviewMonths"
            label="Periodic Review (months)"
            type="number"
            hint="How often documents are reviewed"
          />
          <BaseTextInput
            v-model.number="model.settings.defaultDocumentTemplateReviewLimitDays"
            label="Review Limit (days)"
            type="number"
            hint="Days allowed for review"
          />
          <BaseTextInput
            v-model.number="model.settings.defaultDocumentTemplateApprovalLimitDays"
            label="Approval Limit (days)"
            type="number"
            hint="Days allowed for approval"
          />
        </div>

        <div class="tw:flex tw:flex-col tw:gap-4">
          <div class="tw:flex tw:items-center tw:justify-between">
            <div>
              <div class="tw:text-sm tw:font-medium tw:text-on-sidebar">
                Training Available by Default
              </div>
              <div class="tw:text-xs tw:text-secondary">
                New document templates include training
              </div>
            </div>
            <BaseSwitch v-model="model.settings.defaultDocumentTemplateTrainingAvailable" />
          </div>
          <div class="tw:flex tw:items-center tw:justify-between">
            <div>
              <div class="tw:text-sm tw:font-medium tw:text-on-sidebar">
                Retrain on New Version by Default
              </div>
              <div class="tw:text-xs tw:text-secondary">
                Users must complete training after version updates
              </div>
            </div>
            <BaseSwitch v-model="model.settings.defaultDocumentTemplateRetrainingOnVersion" />
          </div>
          <div class="tw:flex tw:items-center tw:justify-between">
            <div>
              <div class="tw:text-sm tw:font-medium tw:text-on-sidebar">
                Auto Effective on Approval by Default
              </div>
              <div class="tw:text-xs tw:text-secondary">
                Documents become effective immediately upon approval
              </div>
            </div>
            <BaseSwitch v-model="model.settings.defaultDocumentTemplateAutoEffectiveOnApproval" />
          </div>
        </div>
      </div>

      <hr class="tw:border-divider" />

      <!-- Asset Request Defaults -->
      <div class="tw:flex tw:flex-col tw:gap-5">
        <h3 class="tw:text-xs tw:font-bold tw:uppercase tw:tracking-widest tw:text-secondary">
          Asset Request Defaults
        </h3>
        <BaseTextInput
          v-model.number="model.settings.defaultAssetRequestDueDays"
          label="Default Due In (days)"
          type="number"
          hint="Days from today set as due date on new asset requests"
          class="tw:max-w-xs"
        />
      </div>
    </div>
  </div>
</template>

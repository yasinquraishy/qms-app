<script setup>
const modelValue = defineModel({ type: String })

const submitDialogOpen = ref(false)

// Workflow steps for the selected version, ordered by stepOrder
const steps = useLiveQueryWithDeps(
  [() => modelValue.value],
  async (db, [versionId]) => {
    if (!versionId) return []
    return db.WorkflowStep.where('workflowVersionId', versionId).orderBy('stepOrder', 'asc').exec()
  },
  { initial: [] },
)

// Whether the first step has a reviewer assigned (used to gate the Confirm button)
const firstStepHasUser = useLiveQueryWithDeps(
  [() => steps.value[0]?.id],
  async (db, [firstStepId]) => {
    if (!firstStepId) return false
    const su = await db.WorkflowStepUser.where('stepId', firstStepId).first()
    return !!su
  },
  { initial: false },
)

let resolveSubmit = null

function submit() {
  if (!modelValue.value) return Promise.resolve()
  return new Promise((resolve) => {
    resolveSubmit = resolve
    submitDialogOpen.value = true
  })
}

function handleConfirm() {
  if (!firstStepHasUser.value) return
  submitDialogOpen.value = false
  resolveSubmit?.()
  resolveSubmit = null
}

function handleCancel(close) {
  close()
  resolveSubmit?.()
  resolveSubmit = null
}

defineExpose({ submit })
</script>

<template>
  <WorkflowVersionSelect v-model="modelValue" moduleId="NON_CONFORMANCE" />

  <BaseDialog v-model="submitDialogOpen" title="Assign Step Reviewers" maxWidth="lg" persistent>
    <div class="tw:space-y-3 tw:py-2">
      <p class="tw:text-sm tw:text-secondary">
        Select a reviewer for each workflow step before submitting.
      </p>
      <NCWorkflowStepReviewerSelect
        v-for="(step, index) in steps"
        :key="step.id"
        :step="step"
        :stepIndex="index"
        :required="index === 0"
      />
    </div>

    <template #footer="{ close }">
      <div class="tw:flex tw:justify-end tw:gap-2">
        <BaseButton variant="outline" @click="handleCancel(close)">Cancel</BaseButton>
        <BaseButton variant="primary" :disabled="!firstStepHasUser" @click="handleConfirm">
          Confirm
        </BaseButton>
      </div>
    </template>
  </BaseDialog>
</template>

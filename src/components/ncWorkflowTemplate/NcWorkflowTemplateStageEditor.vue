<script setup>
import { useDebounceFn } from '@vueuse/core'
import {
  IconTrash,
  IconShieldCheck,
  IconFileText,
  IconUsers,
  IconCheckbox,
  IconClock,
  IconListDetails,
  IconArrowBackUp,
} from '@tabler/icons-vue'

const props = defineProps({
  stageId: { type: String, required: true },
  versionId: { type: String, required: true },
  canUpdate: { type: Boolean, default: false },
})

const emit = defineEmits(['delete'])

const hasSendBack = ref(false)

const stage = useLiveQueryWithDeps(
  [() => props.stageId],
  async (db, [stageId]) => {
    if (!stageId) return null
    return db.NcWorkflowTemplateStage.findByPk(stageId)
  },
  { initial: null },
)

// Watch active outcomes on mount to set initial hasSendBack
const stageOutcomesForMeta = useLiveQueryWithDeps(
  [() => props.stageId],
  async (db, [stageId]) => {
    if (!stageId) return []
    return db.NcWorkflowTemplateStageOnOutcome.where('stageId', stageId).exec()
  },
  { initial: [] },
)

watch(stageOutcomesForMeta, (outcomes) => {
  hasSendBack.value = outcomes.some((o) => o.outcomeId === 'SEND_BACK')
})

// Debounced auto-save on stage changes
const isFirstLoad = ref(true)
const debouncedSave = useDebounceFn(() => {
  if (!stage.value) return
  stage.value.save()
}, 800)

watch(
  stage,
  () => {
    if (isFirstLoad.value) {
      isFirstLoad.value = false
      return
    }
    debouncedSave()
  },
  { deep: true },
)

// Confirmation before delete
const confirmOpen = ref(false)
async function confirmDelete() {
  if (stage.value) await stage.value.delete()
  emit('delete')
}
</script>

<template>
  <div v-if="stage" class="tw:space-y-10">
    <!-- Stage Details -->
    <section>
      <div class="tw:flex tw:items-center tw:gap-2 tw:mb-5">
        <div class="tw:p-2 tw:rounded-lg tw:bg-primary/10">
          <IconListDetails :size="18" class="tw:text-primary" />
        </div>
        <h3 class="tw:font-bold tw:text-on-main">Stage Details</h3>
      </div>

      <div class="tw:space-y-4">
        <div>
          <label class="tw:block tw:text-xs tw:font-bold tw:text-secondary tw:uppercase tw:mb-1.5">
            Stage Name <span class="tw:text-error">*</span>
          </label>
          <BaseTextInput
            v-model="stage.name"
            placeholder="e.g. Department Head Review"
            :disabled="!canUpdate"
          />
        </div>

        <div>
          <label class="tw:block tw:text-xs tw:font-bold tw:text-secondary tw:uppercase tw:mb-1.5">
            Description
          </label>
          <BaseTextarea
            v-model="stage.description"
            placeholder="Describe what happens in this stage…"
            rows="3"
            :disabled="!canUpdate"
          />
        </div>

        <div class="tw:grid tw:grid-cols-1 tw:sm:grid-cols-2 tw:gap-4">
          <div>
            <label
              class="tw:block tw:text-xs tw:font-bold tw:text-secondary tw:uppercase tw:mb-1.5"
            >
              <span class="tw:flex tw:items-center tw:gap-1.5">
                <IconClock :size="14" />
                SLA (days)
              </span>
            </label>
            <BaseTextInput
              v-model.number="stage.slaDays"
              type="number"
              min="1"
              placeholder="e.g. 5"
              :disabled="!canUpdate"
            />
            <p class="tw:text-xs tw:text-secondary tw:mt-1">Days from stage start</p>
          </div>

          <div>
            <label
              class="tw:block tw:text-xs tw:font-bold tw:text-secondary tw:uppercase tw:mb-1.5"
            >
              <span class="tw:flex tw:items-center tw:gap-1.5">
                <IconShieldCheck :size="14" />
                Require E-Signature
              </span>
            </label>
            <div class="tw:mt-1.5">
              <BaseSwitch
                v-model="stage.requireEsignature"
                label="Require electronic signature to complete stage"
                :disabled="!canUpdate"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Assigned Users -->
    <section>
      <div class="tw:flex tw:items-center tw:gap-2 tw:mb-5">
        <div class="tw:p-2 tw:rounded-lg tw:bg-primary/10">
          <IconUsers :size="18" class="tw:text-primary" />
        </div>
        <h3 class="tw:font-bold tw:text-on-main">Assigned Users</h3>
      </div>

      <NcWorkflowTemplateUserSelector :stageId="stageId" :canUpdate="canUpdate" />
    </section>

    <!-- Allowed Outcomes -->
    <section>
      <div class="tw:flex tw:items-center tw:gap-2 tw:mb-5">
        <div class="tw:p-2 tw:rounded-lg tw:bg-primary/10">
          <IconCheckbox :size="18" class="tw:text-primary" />
        </div>
        <h3 class="tw:font-bold tw:text-on-main">Allowed Outcomes</h3>
      </div>

      <NcWorkflowTemplateOutcomeChips
        :stageId="stageId"
        :canUpdate="canUpdate"
        @sendBackToggled="hasSendBack = $event"
      />
    </section>

    <!-- Send-Back Targets (conditional) -->
    <section v-if="hasSendBack">
      <div class="tw:flex tw:items-center tw:gap-2 tw:mb-5">
        <div class="tw:p-2 tw:rounded-lg tw:bg-amber-100">
          <IconArrowBackUp :size="18" class="tw:text-amber-600" />
        </div>
        <h3 class="tw:font-bold tw:text-on-main">Send-Back Targets</h3>
      </div>
      <p class="tw:text-sm tw:text-secondary tw:mb-4">
        Select which earlier stages this stage can send back to.
      </p>

      <NcWorkflowTemplateSendBackTargets
        :stageId="stageId"
        :versionId="versionId"
        :canUpdate="canUpdate"
      />
    </section>

    <!-- Stage Form Template -->
    <section>
      <div class="tw:flex tw:items-center tw:gap-2 tw:mb-5">
        <div class="tw:p-2 tw:rounded-lg tw:bg-primary/10">
          <IconFileText :size="18" class="tw:text-primary" />
        </div>
        <h3 class="tw:font-bold tw:text-on-main">Stage Form Template</h3>
      </div>
      <p class="tw:text-sm tw:text-secondary tw:mb-4">
        Optionally attach a form template that reviewers complete during this stage.
      </p>

      <NcWorkflowTemplateFormTemplatePicker
        v-model:formTemplateId="stage.formTemplateId"
        :stageId="stageId"
        :canUpdate="canUpdate"
      />
    </section>

    <!-- Danger Zone -->
    <section v-if="canUpdate">
      <div class="tw:border tw:border-error/30 tw:rounded-xl tw:p-5 tw:bg-error/5">
        <h3 class="tw:font-bold tw:text-error tw:mb-1">Danger Zone</h3>
        <p class="tw:text-sm tw:text-secondary tw:mb-4">
          Deleting this stage is irreversible and will remove all associated users, outcomes, and
          targets.
        </p>
        <BaseButton variant="danger" @click="confirmOpen = true">
          <template #icon>
            <IconTrash :size="16" />
          </template>
          Delete Stage
        </BaseButton>
      </div>
    </section>

    <ConfirmDialog
      v-model="confirmOpen"
      title="Delete Stage"
      :message="`Are you sure you want to delete '${stage.name}'? This cannot be undone.`"
      confirmLabel="Delete"
      confirmVariant="danger"
      @confirm="confirmDelete"
    />
  </div>

  <!-- Skeleton when stage not yet loaded -->
  <div v-else class="tw:animate-pulse tw:space-y-6">
    <div class="tw:h-6 tw:w-32 tw:bg-main-hover tw:rounded" />
    <div class="tw:h-10 tw:w-full tw:bg-main-hover tw:rounded-xl" />
    <div class="tw:h-20 tw:w-full tw:bg-main-hover tw:rounded-xl" />
  </div>
</template>

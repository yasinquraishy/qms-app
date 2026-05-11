<script setup>
const props = defineProps({
  stepId: { type: String, required: true },
  canUpdate: { type: Boolean, default: false },
  stepApproversTab: {
    type: String,
    default: 'both',
    validator: (v) => ['roles', 'users', 'both'].includes(v),
  },
})

const isOpen = defineModel({ type: Boolean, default: false })

const approverTab = ref(props.stepApproversTab === 'users' ? 'users' : 'roles')

const showRoleSelector = computed(
  () =>
    props.stepApproversTab !== 'users' &&
    (props.stepApproversTab !== 'both' || approverTab.value === 'roles'),
)
const showUserSelector = computed(
  () =>
    props.stepApproversTab !== 'roles' &&
    (props.stepApproversTab !== 'both' || approverTab.value === 'users'),
)
</script>

<template>
  <BaseDialog v-model="isOpen" title="Manage Step Assignees" maxWidth="2xl">
    <div class="tw:border tw:border-divider tw:rounded-xl tw:overflow-hidden">
      <div
        v-if="stepApproversTab === 'both'"
        class="tw:flex tw:border-b tw:border-divider tw:bg-main-hover"
      >
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
        <WorkflowRoleSelector v-show="showRoleSelector" :stepId="stepId" :canUpdate="canUpdate" />
        <WorkflowUserSelector v-show="showUserSelector" :stepId="stepId" :canUpdate="canUpdate" />
      </div>
    </div>

    <template #footer="{ close }">
      <BaseButton variant="primary" @click="close">Done</BaseButton>
    </template>
  </BaseDialog>
</template>

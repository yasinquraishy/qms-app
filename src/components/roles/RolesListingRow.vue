<script setup>
import { useRoles } from '@/composables/useRoles.js'
import { getCompanyPath } from '@/utils/routeHelpers'
import { useQuasar } from 'quasar'
import { isAllowed } from '@/utils/currentSession.js'

const props = defineProps({
  role: {
    type: Object,
    required: true,
  },
})

const $q = useQuasar()
const router = useRouter()
const { deactivateRole, activateRole } = useRoles()

const canUpdateRole = computed(() => isAllowed(['roles:update']))
const isInactive = computed(() => props.role.statusId === 'INACTIVE')

function navigateToRole() {
  router.push(getCompanyPath(`/roles/${props.role.id}`))
}

function handleDeactivate() {
  $q.dialog({
    title: 'Deactivate Role',
    message: `Are you sure you want to deactivate the role "${props.role.name}"?\n\nDeactivating a role will set its status to Inactive. The role will no longer be assignable to new users, but existing user assignments will remain unaffected.`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const success = await deactivateRole(props.role.id)
    if (success) {
      $q.notify({
        type: 'positive',
        message: 'Role deactivated successfully',
      })
    } else {
      $q.notify({
        type: 'negative',
        message: 'Failed to deactivate role',
      })
    }
  })
}

function handleActivate() {
  $q.dialog({
    title: 'Activate Role',
    message: `Are you sure you want to activate the role "${props.role.name}"?\n\nActivating the role will set its status back to Active and allow it to be assigned to new users.`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const success = await activateRole(props.role.id)
    if (success) {
      $q.notify({
        type: 'positive',
        message: 'Role activated successfully',
      })
    } else {
      $q.notify({
        type: 'negative',
        message: 'Failed to activate role',
      })
    }
  })
}
</script>

<template>
  <div
    class="tw:bg-sidebar tw:border tw:border-divider tw:rounded-xl tw:p-4 tw:hover:shadow-md tw:hover:border-primary/30 tw:transition-all tw:group tw:relative tw:cursor-pointer"
    @click="navigateToRole"
  >
    <div class="tw:flex tw:justify-between tw:items-start tw:gap-4">
      <div class="tw:flex-1">
        <div class="tw:flex tw:items-center tw:gap-2 tw:mb-2">
          <!-- Role Badges -->
          <RoleStatusBadge v-if="role.statusId" :status="role.statusId" />
          <span class="tw:text-xs tw:text-secondary">•</span>
          <span class="tw:text-xs tw:text-secondary">ID: {{ role.code || role.id }}</span>
        </div>

        <h3 class="tw:text-lg tw:font-bold tw:text-on-sidebar tw:mb-2">
          {{ role.name }}
        </h3>
        <p class="tw:text-sm tw:text-secondary tw:leading-relaxed tw:max-w-3xl">
          {{ role.description || 'No description provided' }}
        </p>
      </div>

      <!-- More Options Button -->
      <QBtn
        v-if="canUpdateRole"
        icon="more_horiz"
        flat
        dense
        round
        class="tw:text-secondary tw:hover:text-primary"
        @click.stop
      >
        <QMenu>
          <QList class="tw:min-w-40">
            <QItem v-if="isInactive" v-close-popup clickable @click="handleActivate">
              <QItemSection avatar>
                <WIcon icon="check_circle" size="20px" class="tw:text-positive!" />
              </QItemSection>
              <QItemSection class="tw:text-positive">Activate Role</QItemSection>
            </QItem>
            <QItem v-else v-close-popup clickable @click="handleDeactivate">
              <QItemSection avatar>
                <WIcon icon="block" size="20px" class="tw:text-warning!" />
              </QItemSection>
              <QItemSection class="tw:text-warning">Deactivate Role</QItemSection>
            </QItem>
          </QList>
        </QMenu>
      </QBtn>
    </div>

    <!-- Role Metadata Footer -->
    <div
      class="tw:mt-2 tw:flex tw:flex-wrap tw:items-center tw:gap-6 tw:border-t tw:border-divider tw:pt-2"
    >
      <div class="tw:flex tw:items-center tw:gap-2 tw:text-sm">
        <WIcon icon="group" size="sm" class="tw:text-secondary" />
        <span class="tw:font-medium tw:text-on-sidebar">
          {{ role.userCount || 0 }} Assigned Users
        </span>
      </div>

      <div class="tw:flex tw:items-center tw:gap-2 tw:text-sm">
        <WIcon icon="history" size="sm" class="tw:text-secondary" />
        <span class="tw:text-secondary"
          >Last Modified: {{ role.updatedAt.formatDate('date') }}</span
        >
      </div>

      <!-- <div class="tw:flex tw:items-center tw:gap-2 tw:text-sm">
        <WIcon icon="verified_user" size="sm" class="tw:text-secondary" />
        <span class="tw:text-secondary tw:italic">
          {{ role.securityLevel || 'High Security Level' }}
        </span>
      </div> -->
    </div>
  </div>
</template>

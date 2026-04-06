<script setup>
import { useQuasar } from 'quasar'
import { getCompanyPath } from '@/utils/routeHelpers'

const props = defineProps({
  group: {
    type: Object,
    required: true,
  },
  canDelete: {
    type: Boolean,
    default: false,
  },
})

const $q = useQuasar()
const { deleteGroup } = useGroups()
const router = useRouter()

// Get user count from userAssignments
const userCount = computed(() => {
  return props.group.userAssignments?.length || 0
})

// Get first few user names for preview
const userPreview = computed(() => {
  const assignments = props.group.userAssignments || []
  const users = assignments
    .slice(0, 3)
    .map((a) => `${a.user?.firstName || ''} ${a.user?.lastName || ''}`.trim())
  if (assignments.length > 3) {
    users.push(`+${assignments.length - 3} more`)
  }
  return users.join(', ') || 'No members'
})

function onClick() {
  router.push(getCompanyPath(`/groups/${props.group.id}`))
}

function onDeleteClick(event) {
  event.stopPropagation()
  $q.dialog({
    title: 'Confirm Deletion',
    message: `Are you sure you want to delete group "${props.group.name}"? This action cannot be undone.`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    const result = await deleteGroup(props.group.id)
    if (result.error) {
      $q.notify({ type: 'negative', message: result.error })
    } else {
      $q.notify({ type: 'positive', message: 'Group deleted successfully' })
    }
  })
}
</script>

<template>
  <WCard flat bordered class="tw:p-3 tw:cursor-pointer" @click="onClick">
    <div class="tw:flex tw:items-center tw:gap-3">
      <!-- Avatar with group color -->
      <TeamAvatar :team="group" class="tw:size-12" />

      <!-- Group Info -->
      <div class="tw:flex-1 tw:min-w-0">
        <div class="tw:text-lg tw:font-bold tw:text-on-main">
          {{ group.name }}
        </div>
        <div class="tw:text-sm tw:text-secondary">
          {{ userCount }} member{{ userCount !== 1 ? 's' : '' }}
        </div>
        <div class="tw:text-xs tw:text-secondary tw:mt-1 tw:truncate tw:max-w-100">
          {{ userPreview }}
        </div>
      </div>

      <!-- Leadership Badge -->
      <div v-if="group.isLeadership" class="tw:flex-none">
        <QBadge color="primary" class="tw:px-2 tw:py-1" rounded> Leadership </QBadge>
      </div>

      <!-- Actions Menu -->
      <div v-if="canDelete" class="tw:flex-none" @click.stop>
        <QBtn flat round dense icon="more_vert" color="grey">
          <QMenu>
            <QList>
              <QItem v-close-popup clickable class="tw:text-negative" @click="onDeleteClick">
                <QItemSection avatar>
                  <QIcon name="delete" color="negative" />
                </QItemSection>
                <QItemSection>Delete</QItemSection>
              </QItem>
            </QList>
          </QMenu>
        </QBtn>
      </div>
    </div>
  </WCard>
</template>

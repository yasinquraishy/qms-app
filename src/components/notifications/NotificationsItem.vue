<script setup>
import { useNotifications } from '@/composables/useNotifications.js'
import { getCompanyPath } from '@/utils/routeHelpers'

const props = defineProps({
  notification: { type: Object, required: true },
})
const emit = defineEmits(['close'])
const { markAsRead } = useNotifications()
const router = useRouter()

const timeAgo = computed(() => {
  return props.notification.createdAt ? props.notification.createdAt.toRelative() : ''
})

const typeIcon = computed(() => {
  const icons = {
    DOCUMENT_APPROVED: 'task_alt',
    WORKFLOW_ACTION_REQUIRED: 'pending_actions',
    RECORD_ASSIGNED: 'assignment_ind',
    TASK_ASSIGNED: 'assignment',
    DOCUMENT_MESSAGE: 'forum',
    SYSTEM: 'info',
  }
  return icons[props.notification.notificationTypeId] || 'notifications'
})

const typeColor = computed(() => {
  const colors = {
    DOCUMENT_APPROVED: 'positive',
    WORKFLOW_ACTION_REQUIRED: 'warning',
    RECORD_ASSIGNED: 'info',
    TASK_ASSIGNED: 'accent',
    DOCUMENT_MESSAGE: 'info',
    SYSTEM: 'grey',
  }
  return colors[props.notification.notificationTypeId] || 'grey'
})

const RESOURCE_ROUTES = {
  Document: (id) => getCompanyPath(`/documents/${id}`),
  Record: (id) => getCompanyPath(`/records/${id}`),
  WorkflowInstance: (id) => getCompanyPath(`/workflow-instances/${id}`),
  TaskInstance: (id) => getCompanyPath(`/task-instances/${id}`),
}

const resourcePath = computed(() => {
  const { resourceType, resourceId } = props.notification
  if (!resourceType || !resourceId) return null
  const builder = RESOURCE_ROUTES[resourceType]
  if (!builder) return null
  return builder(resourceId)
})

async function handleClick() {
  if (!props.notification.isRead) {
    await markAsRead(props.notification.id)
  }
  emit('close')
  if (resourcePath.value) {
    router.push(resourcePath.value)
  }
}
</script>

<template>
  <QItem
    clickable
    :class="['tw:transition-colors', !notification.isRead ? 'tw:bg-blue-50/50' : 'tw:bg-sidebar']"
    @click="handleClick"
  >
    <QItemSection avatar>
      <QIcon :name="typeIcon" :color="typeColor" size="24px" />
    </QItemSection>

    <QItemSection>
      <QItemLabel
        :class="[!notification.isRead ? 'tw:font-semibold' : 'tw:font-normal']"
        class="tw:text-sm"
      >
        {{ notification.title }}
      </QItemLabel>
      <QItemLabel v-if="notification.message" caption lines="2" class="tw:text-xs tw:mt-0.5">
        {{ notification.message }}
      </QItemLabel>
      <QItemLabel caption class="tw:text-xs tw:mt-1 tw:text-gray-400">
        {{ timeAgo }}
        <span v-if="notification.creator">
          &middot; {{ notification.creator.firstName }} {{ notification.creator.lastName }}
        </span>
      </QItemLabel>
    </QItemSection>

    <QItemSection v-if="!notification.isRead" side>
      <div class="tw:w-2.5 tw:h-2.5 tw:rounded-full tw:bg-blue-500" />
    </QItemSection>

    <QItemSection v-else-if="resourcePath" side>
      <QIcon name="chevron_right" color="grey-5" size="18px" />
    </QItemSection>
  </QItem>
</template>

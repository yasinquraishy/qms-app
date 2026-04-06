<script setup>
import { useNotifications } from '@/composables/useNotifications.js'

const emit = defineEmits(['close'])
const { notifications, unreadCount, loading, markAllAsRead } = useNotifications()
const route = useRoute()

const previewNotifications = computed(() => notifications.value.slice(0, 6))

const viewAllPath = computed(() => `/${route.params.companyCode}/notifications`)

async function handleMarkAllRead() {
  await markAllAsRead()
}

function handleViewAll() {
  emit('close')
}
</script>

<template>
  <div class="tw:flex tw:flex-col">
    <!-- Header -->
    <div
      class="tw:flex tw:items-center tw:justify-between tw:px-4 tw:py-3 tw:border-b tw:border-divider"
    >
      <span class="tw:font-semibold tw:text-base">Notifications</span>
      <QBtn
        v-if="unreadCount > 0"
        flat
        dense
        noCaps
        color="primary"
        label="Mark all read"
        size="sm"
        @click="handleMarkAllRead"
      />
    </div>

    <!-- Loading -->
    <div v-if="loading" class="tw:flex tw:justify-center tw:py-8">
      <QSpinner color="primary" size="32px" />
    </div>

    <!-- Empty state -->
    <div
      v-else-if="notifications.length === 0"
      class="tw:flex tw:flex-col tw:items-center tw:justify-center tw:py-8 tw:text-gray-400"
    >
      <QIcon name="notifications_none" size="48px" />
      <span class="tw:mt-2 tw:text-sm">No notifications yet</span>
    </div>

    <!-- Notification list (latest 6) -->
    <QList v-else class="tw:overflow-y-auto" separator>
      <NotificationsItem
        v-for="notification in previewNotifications"
        :key="notification.id"
        :notification="notification"
        @close="emit('close')"
      />
    </QList>

    <!-- View all footer -->
    <div
      v-if="notifications.length > 0"
      class="tw:border-t tw:border-divider tw:px-4 tw:py-2.5 tw:text-center"
    >
      <RouterLink
        :to="viewAllPath"
        class="tw:text-sm tw:text-primary tw:font-medium"
        @click="handleViewAll"
      >
        View all notifications
        <span v-if="notifications.length > 6" class="tw:text-gray-400 tw:font-normal">
          ({{ notifications.length }}+)
        </span>
      </RouterLink>
    </div>
  </div>
</template>

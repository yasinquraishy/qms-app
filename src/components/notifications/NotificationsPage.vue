<script setup>
import { useNotifications } from '@/composables/useNotifications.js'

const { notifications, unreadCount, loading, markAllAsRead } = useNotifications()

const filter = ref('all') // 'all' | 'unread'

const filteredNotifications = computed(() => {
  if (filter.value === 'unread') return notifications.value.filter((n) => !n.isRead)
  return notifications.value
})

async function handleMarkAllRead() {
  await markAllAsRead()
}
</script>

<template>
  <div class="tw:max-w-3xl tw:mx-auto tw:px-4 tw:py-6">
    <!-- Page header -->
    <div class="tw:flex tw:items-center tw:justify-between tw:mb-6">
      <div>
        <h1 class="tw:text-2xl tw:font-bold">Notifications</h1>
        <p v-if="unreadCount > 0" class="tw:text-sm tw:text-gray-500 tw:mt-0.5">
          {{ unreadCount }} unread
        </p>
      </div>
      <QBtn
        v-if="unreadCount > 0"
        flat
        noCaps
        color="primary"
        label="Mark all as read"
        icon="done_all"
        @click="handleMarkAllRead"
      />
    </div>

    <!-- Filter tabs -->
    <QTabs
      v-model="filter"
      dense
      align="left"
      class="tw:mb-4"
      activeColor="primary"
      indicatorColor="primary"
    >
      <QTab name="all" label="All" />
      <QTab name="unread" label="Unread" />
    </QTabs>

    <!-- Loading -->
    <div v-if="loading" class="tw:flex tw:justify-center tw:py-16">
      <QSpinner color="primary" size="48px" />
    </div>

    <!-- Empty state -->
    <div
      v-else-if="filteredNotifications.length === 0"
      class="tw:flex tw:flex-col tw:items-center tw:justify-center tw:py-16 tw:text-gray-400"
    >
      <QIcon name="notifications_none" size="64px" />
      <p class="tw:mt-3 tw:text-base">
        {{ filter === 'unread' ? 'No unread notifications' : 'No notifications yet' }}
      </p>
    </div>

    <!-- Notification list -->
    <div v-else class="tw:rounded-lg tw:border tw:border-divider tw:overflow-hidden">
      <QList separator>
        <NotificationsItem
          v-for="notification in filteredNotifications"
          :key="notification.id"
          :notification="notification"
        />
      </QList>
    </div>
  </div>
</template>

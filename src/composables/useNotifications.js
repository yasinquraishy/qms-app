import { currentCompany } from '@/utils/currentCompany.js'
import { get, patch } from '@/api'
import { getSocket, connectSocket } from '@/api/socket.js'
import { DateTime } from 'luxon'

const symbol = Symbol('useNotifications')

function NotificationsState() {
  const notifications = ref([])
  const unreadCount = ref(0)
  const loading = ref(false)

  async function fetchNotifications() {
    const data = await get('/v1/services/notifications', {
      params: { limit: 50 },
      loader: loading,
    })
    notifications.value = data.notifications || []
  }

  async function fetchUnreadCount() {
    const data = await get('/v1/services/notifications/unreadCount', {
      showError: false,
    })
    unreadCount.value = data.unreadCount || 0
  }

  async function markAsRead(id) {
    await patch(
      `/v1/services/notifications/${id}/read`,
      {},
      {
        showSuccess: false,
      },
    )

    const notification = notifications.value.find((n) => n.id === id)
    if (notification && !notification.isRead) {
      notification.isRead = true
      notification.readAt = DateTime.now()
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
  }

  async function markAllAsRead() {
    await patch(
      '/v1/services/notifications/markAllRead',
      {},
      {
        showSuccess: false,
      },
    )

    notifications.value.forEach((n) => {
      n.isRead = true
      n.readAt = DateTime.now()
    })
    unreadCount.value = 0
  }

  function setupSocketListeners() {
    const socket = getSocket() || connectSocket()
    if (!socket) return

    socket.on('notification:new', (notification) => {
      notifications.value.unshift(notification)
      unreadCount.value++
    })
  }

  // Auto-fetch on company change
  watch(
    () => currentCompany.value?.id,
    (id) => {
      if (id) {
        fetchNotifications()
        fetchUnreadCount()
      }
    },
    { immediate: true },
  )

  onMounted(() => {
    setupSocketListeners()
  })

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
  }
}

/**
 * @returns {ReturnType<typeof NotificationsState>}
 */
function useNotifications() {
  return inject(symbol)
}

function provideNotifications() {
  const state = NotificationsState()
  provide(symbol, state)
  return state
}

export { useNotifications, provideNotifications }

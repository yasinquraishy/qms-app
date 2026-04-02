<script setup>
import { useNotifications } from '@/composables/useNotifications.js'

const { unreadCount } = useNotifications()
const showPanel = ref(false)
</script>

<template>
  <div class="tw:relative">
    <QBtn flat round icon="notifications" color="primary">
      <QBadge
        v-if="unreadCount > 0"
        color="red"
        floating
        rounded
        :label="unreadCount > 99 ? '99+' : unreadCount"
        @click.stop="showPanel = !showPanel"
      />
    </QBtn>

    <QMenu
      v-model="showPanel"
      anchor="bottom right"
      self="top right"
      :offset="[0, 8]"
      class="tw:w-96 tw:max-h-125"
    >
      <NotificationsPanel @close="showPanel = false" />
    </QMenu>
  </div>
</template>

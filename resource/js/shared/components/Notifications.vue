<script setup>
import { useRouter } from 'vue-router'
import WBtn from './button/WBtn'
import WIcon from './icon/WIcon'
import WAvatar from './avatar/WAvatar'

defineOptions({
  name: 'AppNotifications',
})

const props = defineProps({
  location: {
    type: String,
    default: 'bottom right',
  },
  badgeProps: {
    type: Object,
    default: () => ({}),
  },
  count: {
    type: [Number, String],
    default: 0,
  },
  notifications: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['click:readAllNotifications'])

const router = useRouter()

const gotoNotification = () => {
  router.push('/notifications')
}

const avatarText = (value) => {
  if (!value) return ''
  return value
    .split(' ')
    .map((name) => name.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase()
}
</script>

<template>
  <WBtn :color="null" round flat>
    <div class="relative-position">
      <WIcon icon="tabler:bell" size="26" />

      <QBadge
        v-if="props.count"
        floating
        color="red"
        textColor="white"
        :label="props.count"
        v-bind="badgeProps"
      />
    </div>

    <QMenu
      v-if="props.notifications.length"
      :anchor="props.location"
      self="top right"
      width="380px"
      class="overflow-hidden"
    >
      <QList class="q-py-none">
        <!-- Header -->
        <QItem class="notification-section q-px-md" style="block-size: 48px">
          <QItemSection>
            <div class="text-subtitle1">Notifications</div>
          </QItemSection>
          <QItemSection v-if="props.notifications.length" side>
            <QChip color="primary" size="sm" class="q-px-sm">
              {{ props.notifications.length }} New
            </QChip>
          </QItemSection>
        </QItem>

        <QSeparator />

        <!-- Notifications list -->
        <template v-for="(notification, index) in props.notifications" :key="index">
          <QItem clickable lines="one" class="q-py-md">
            <!-- Prepend -->
            <QItemSection side>
              <WAvatar :color="notification.color || 'primary'" size="40px" class="q-mr-sm">
                <QImg v-if="notification.img" :src="notification.img" />
                <WIcon v-else-if="notification.icon" :icon="notification.icon" />
                <span v-else-if="notification.text" class="text-uppercase text-caption font-bold">
                  {{ avatarText(notification.text) }}
                </span>
                <WIcon v-else icon="tabler:bell" />
              </WAvatar>
            </QItemSection>

            <!-- Main Content -->
            <QItemSection>
              <QItemLabel class="font-bold">{{ notification.title }}</QItemLabel>
              <QItemLabel caption>
                {{ notification.subtitle }}
              </QItemLabel>
            </QItemSection>

            <!-- Time -->
            <QItemSection side>
              <small class="text-grey-7">{{ notification.time }}</small>
            </QItemSection>
          </QItem>
          <QSeparator v-if="index < props.notifications.length - 1" />
        </template>

        <!-- Footer -->
        <QItem class="notification-section">
          <WBtn
            class="full-width"
            label="READ ALL NOTIFICATIONS"
            flat
            @click="
              () => {
                emit('click:readAllNotifications')
                gotoNotification()
              }
            "
          />
        </QItem>
      </QList>
    </QMenu>
  </WBtn>
</template>

<style lang="scss">
.notification-section {
  padding: 14px !important;
}
</style>

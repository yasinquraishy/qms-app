<script setup>
import {
  IconCirclePlus,
  IconPencil,
  IconTrash,
  IconArrowsHorizontal,
  IconSend,
  IconCircleCheck,
  IconCircleX,
  IconArchive,
  IconHistory,
  IconLink,
  IconLinkOff,
  IconInfoCircle,
  IconShieldCheck,
} from '@tabler/icons-vue'
const props = defineProps({
  documentId: {
    type: String,
    required: true,
  },
})

const auditLogs = useLiveQueryWithDeps(
  [() => props.documentId],
  async (db, [documentId]) => {
    return db.AuditLog.where('[entityType+entityId]', ['Document', documentId])
      .orderBy('createdAt', 'desc')
      .exec()
  },
  { initial: [] },
)

const users = useLiveQuery(async (db) => db.User.where().exec(), { initial: [] })

const usersById = computed(() => {
  const map = {}
  for (const u of users.value) map[u.id] = u
  return map
})

function getActionIcon(action) {
  const map = {
    CREATE: IconCirclePlus,
    UPDATE: IconPencil,
    DELETE: IconTrash,
    STATUS_CHANGE: IconArrowsHorizontal,
    SUBMIT_FOR_REVIEW: IconSend,
    APPROVE: IconCircleCheck,
    REJECT: IconCircleX,
    ARCHIVE: IconArchive,
    VERSION_CREATE: IconHistory,
    LINK_CREATE: IconLink,
    LINK_DELETE: IconLinkOff,
  }
  return map[action] || IconInfoCircle
}

function getActionColor(action) {
  const map = {
    CREATE: 'tw:text-green-600',
    APPROVE: 'tw:text-green-600',
    REJECT: 'tw:text-red-600',
    DELETE: 'tw:text-red-600',
    ARCHIVE: 'tw:text-gray-500',
  }
  return map[action] || 'tw:text-blue-600'
}

function getPerformerName(log) {
  const user = usersById.value[log.performedBy]
  if (!user) return 'System'
  return `${user.firstName} ${user.lastName}`.trim()
}
</script>

<template>
  <div class="tw:p-6">
    <h3 class="tw:text-lg tw:font-bold tw:text-on-sidebar tw:mb-4">Audit Log</h3>

    <!-- Loading -->
    <div v-if="auditLogs === undefined" class="tw:flex tw:justify-center tw:py-8">
      <div
        class="tw:animate-spin tw:rounded-full tw:size-8 tw:border-4 tw:border-primary tw:border-t-transparent"
      />
    </div>

    <!-- Timeline -->
    <div v-else-if="auditLogs.length > 0" class="tw:space-y-3">
      <div
        v-for="log in auditLogs"
        :key="log.id"
        class="tw:flex tw:gap-4 tw:p-3 tw:bg-main-hover tw:rounded-lg"
      >
        <div class="tw:shrink-0">
          <component
            :is="getActionIcon(log.action)"
            :size="22"
            :class="getActionColor(log.action)"
          />
        </div>
        <div class="tw:flex-1">
          <div class="tw:flex tw:items-center tw:justify-between">
            <div class="tw:text-sm tw:font-semibold tw:text-on-sidebar">
              {{ log.action.replace(/_/g, ' ') }}
            </div>
            <div class="tw:text-xs tw:text-secondary">
              {{ log.performedAt.formatDate('date') }}
            </div>
          </div>
          <div class="tw:text-xs tw:text-secondary tw:mt-0.5">by {{ getPerformerName(log) }}</div>
          <div v-if="log.newValueJson" class="tw:text-xs tw:text-secondary tw:mt-1">
            {{
              typeof log.newValueJson === 'string'
                ? log.newValueJson
                : JSON.stringify(log.newValueJson)
            }}
          </div>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else class="tw:text-center tw:py-8 tw:text-secondary">
      <IconShieldCheck :size="40" class="tw:text-secondary tw:mb-2 tw:mx-auto" />
      <div>No audit log entries yet.</div>
    </div>
  </div>
</template>

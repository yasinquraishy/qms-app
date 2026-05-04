<script setup>
import { useRoute } from 'vue-router'

const props = defineProps({
  log: {
    type: Object,
    required: true,
  },
})

const route = useRoute()
const companyCode = computed(() => route.params.companyCode)
const expanded = ref(false)
const hasDiff = computed(() => props.log.oldValueJson || props.log.newValueJson)

// Resolve performer from synced User model in IDB
const performer = useLiveQuery(
  (db) => (props.log.performedBy ? db.User.findByPk(props.log.performedBy) : Promise.resolve(null)),
  { models: 'User' },
)

const performerName = computed(() => {
  if (!performer.value) return 'System'
  return `${performer.value.firstName} ${performer.value.lastName}`.trim()
})
</script>

<template>
  <div class="tw:hover:bg-main-hover tw:transition-colors">
    <div
      class="tw:px-5 tw:py-3 tw:flex tw:items-start tw:gap-4"
      :class="{ 'tw:cursor-pointer': hasDiff }"
      @click="hasDiff && (expanded = !expanded)"
    >
      <!-- Action badge -->
      <div class="tw:shrink-0 tw:pt-0.5">
        <AuditLogActionBadge :action="log.action" />
      </div>

      <!-- Content -->
      <div class="tw:flex-1 tw:min-w-0">
        <div class="tw:flex tw:items-center tw:gap-2 tw:flex-wrap">
          <AuditLogEntityLink
            :entityType="log.entityType"
            :entityId="log.entityId"
            :contextLabel="log.contextLabel"
            :companyCode="companyCode"
          />
          <span
            class="tw:text-[10px] tw:px-1.5 tw:py-0.5 tw:rounded tw:bg-main tw:text-secondary tw:border tw:border-divider"
          >
            {{ log.entityType }}
          </span>
        </div>
        <div class="tw:text-xs tw:text-secondary tw:mt-0.5">
          by {{ performerName }}
          <span class="tw:mx-1">&middot;</span>
          {{ log.createdAt?.formatDate('datetime') }}
        </div>
      </div>

      <!-- Expand toggle if there's a diff -->
      <div v-if="hasDiff" class="tw:shrink-0 tw:text-secondary tw:text-xs">
        {{ expanded ? '▲' : '▼' }}
      </div>
    </div>

    <!-- Diff viewer -->
    <div v-if="expanded && hasDiff" class="tw:px-5 tw:pb-4">
      <AuditLogsDiffViewer
        :entityType="log.entityType"
        :oldValueJson="log.oldValueJson"
        :newValueJson="log.newValueJson"
      />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  ncId: {
    type: String,
    required: true,
  },
})

const eventTypes = useLiveQuery((db) => db.NcEventType.where().exec(), { initial: [] })

const entries = useLiveQueryWithDeps(
  [() => props.ncId],
  async (db, [ncId]) => {
    return db.NcHistory.where('ncId', ncId).orderBy('performedAt', 'asc').exec()
  },
  { initial: [] },
)

function getEventType(id) {
  return eventTypes.value?.find((e) => e.id === id)
}
</script>

<template>
  <div class="tw:flex tw:flex-col tw:gap-0">
    <div v-if="entries.length === 0" class="tw:text-sm tw:text-secondary">No history yet.</div>

    <div v-for="(entry, index) in entries" :key="entry.id" class="tw:flex tw:gap-3">
      <!-- Timeline line -->
      <div class="tw:flex tw:flex-col tw:items-center">
        <div class="tw:w-2.5 tw:h-2.5 tw:rounded-full tw:bg-primary tw:mt-1.5 tw:shrink-0" />
        <div v-if="index < entries.length - 1" class="tw:w-px tw:flex-1 tw:bg-divider tw:mt-1" />
      </div>

      <!-- Event content -->
      <div class="tw:pb-4 tw:flex-1 tw:min-w-0">
        <div class="tw:flex tw:items-center tw:gap-2 tw:flex-wrap">
          <span class="tw:text-sm tw:font-medium tw:text-on-main">
            {{ getEventType(entry.eventTypeId)?.name ?? entry.eventTypeId }}
          </span>
          <span class="tw:text-xs tw:text-placeholder">
            {{ entry.performedAt ? dt.formatDate(entry.performedAt) : '' }}
          </span>
        </div>
        <p v-if="entry.notes" class="tw:text-sm tw:text-secondary tw:mt-0.5 tw:whitespace-pre-wrap">
          {{ entry.notes }}
        </p>
      </div>
    </div>
  </div>
</template>

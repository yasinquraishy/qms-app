<script setup>
defineProps({
  auditLogs: { type: Array, default: () => [] },
})

function auditIcon(action) {
  if (action?.includes('APPROVE')) return 'check'
  if (action?.includes('REJECT')) return 'close'
  if (action?.includes('REQUEST_CHANGES')) return 'edit_note'
  if (action?.includes('SUBMIT')) return 'send'
  return 'history'
}

function auditColor(action) {
  if (action?.includes('APPROVE') || action?.includes('COMPLETED')) return 'emerald'
  if (action?.includes('REJECT') || action?.includes('REQUEST_CHANGES')) return 'red'
  return 'slate'
}
</script>

<template>
  <div
    class="tw:bg-sidebar tw:rounded-xl tw:shadow-sm tw:border tw:border-divider tw:flex tw:flex-col tw:overflow-hidden"
  >
    <div
      class="tw:px-5 tw:py-4 tw:border-b tw:border-divider tw:flex tw:items-center tw:justify-between"
    >
      <h3 class="tw:font-bold tw:text-on-main tw:flex tw:items-center tw:gap-2">
        <WIcon name="history" size="20px" class="tw:text-primary" />
        Audit Trail
      </h3>
    </div>

    <div class="tw:p-5 tw:overflow-y-auto tw:max-h-150">
      <div
        class="tw:space-y-6 tw:relative tw:before:absolute tw:before:left-2.5 tw:before:top-2 tw:before:bottom-2 tw:before:w-px tw:before:bg-divider"
      >
        <div v-for="log in auditLogs" :key="log.id" class="tw:relative tw:pl-8">
          <div
            class="tw:absolute tw:left-0 tw:top-1 tw:size-5 tw:rounded-full tw:border-2 tw:flex tw:items-center tw:justify-center tw:z-10"
            :class="{
              'tw:bg-emerald-100 tw:border-emerald-500': auditColor(log.action) === 'emerald',
              'tw:bg-red-100 tw:border-red-500': auditColor(log.action) === 'red',
              'tw:bg-slate-100 tw:border-slate-300': auditColor(log.action) === 'slate',
            }"
          >
            <div
              v-if="auditColor(log.action) === 'slate'"
              class="tw:size-1.5 tw:bg-slate-400 tw:rounded-full"
            ></div>
            <WIcon
              v-else
              :name="auditIcon(log.action)"
              size="10px"
              :class="{
                'tw:text-emerald-600': auditColor(log.action) === 'emerald',
                'tw:text-red-600': auditColor(log.action) === 'red',
              }"
            />
          </div>
          <div class="tw:space-y-1">
            <p class="tw:text-xs tw:font-semibold tw:text-on-main">
              {{ log.action?.replace(/_/g, ' ') }}
              <span v-if="log.performer" class="tw:font-normal tw:text-secondary">
                by {{ log.performer.firstName }} {{ log.performer.lastName }}
              </span>
            </p>
            <p class="tw:text-[10px] tw:text-secondary">
              {{ log.performedAt.formatDate('date') }}
            </p>
          </div>
        </div>

        <div v-if="!auditLogs.length" class="tw:text-center tw:text-secondary tw:text-xs tw:py-4">
          No audit entries yet
        </div>
      </div>
    </div>

    <div class="tw:mt-auto tw:p-4 tw:bg-main tw:border-t tw:border-divider">
      <div class="tw:flex tw:items-center tw:gap-3">
        <WIcon name="sym_o_shield_lock" size="18px" class="tw:text-secondary" />
        <p class="tw:text-[10px] tw:text-secondary tw:leading-tight">
          This audit trail is tamper-evident and compliant with 21 CFR Part 11 electronic record
          requirements.
        </p>
      </div>
    </div>
  </div>
</template>

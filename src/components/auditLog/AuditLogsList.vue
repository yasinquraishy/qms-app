<script setup>
defineProps({
  sortedModules: {
    type: Array,
    required: true,
  },
})

const MODULE_META = {
  DOCUMENT_CONTROL: { label: 'Document Control', icon: 'description', color: 'tw:text-blue-600' },
  TRAINING_MANAGEMENT: {
    label: 'Training Management',
    icon: 'school',
    color: 'tw:text-purple-600',
  },
  NON_CONFORMANCE: {
    label: 'Non-Conformance',
    icon: 'report_problem',
    color: 'tw:text-orange-600',
  },
  CAPA: { label: 'CAPA', icon: 'build', color: 'tw:text-teal-600' },
  OTHER: { label: 'Other', icon: 'more_horiz', color: 'tw:text-gray-600' },
}

function getModuleMeta(moduleId) {
  return MODULE_META[moduleId] || MODULE_META.OTHER
}
</script>

<template>
  <div class="tw:space-y-6">
    <div
      v-for="group in sortedModules"
      :key="group.id"
      class="tw:bg-sidebar tw:rounded-xl tw:border tw:border-divider tw:overflow-hidden"
    >
      <!-- Module header -->
      <div class="tw:px-5 tw:py-4 tw:border-b tw:border-divider tw:flex tw:items-center tw:gap-3">
        <WIcon
          :name="getModuleMeta(group.id).icon"
          size="22px"
          :class="getModuleMeta(group.id).color"
        />
        <div>
          <h3 class="tw:font-bold tw:text-on-main tw:text-sm">
            {{ getModuleMeta(group.id).label }}
          </h3>
          <span class="tw:text-[10px] tw:text-secondary">
            {{ group.logs.length }} {{ group.logs.length === 1 ? 'entry' : 'entries' }}
          </span>
        </div>
      </div>

      <!-- Audit log entries -->
      <div class="tw:divide-y tw:divide-divider">
        <AuditLogsItem v-for="log in group.logs" :key="log.id" :log="log" />
      </div>
    </div>
  </div>
</template>

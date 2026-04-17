<script setup>
defineProps({
  required: {
    type: Boolean,
    default: false,
  },
  multiple: {
    type: Boolean,
    default: false,
  },
})

const modelValue = defineModel({
  type: [String, Array, null],
  default: null,
})

const severities = useLiveQuery((db) => db.NcSeverity.where().exec(), { initial: [] })

function getArray() {
  return Array.isArray(modelValue.value) ? modelValue.value : []
}
</script>

<template>
  <BaseSelectMenu
    v-model="modelValue"
    :items="severities"
    :required="required"
    :multiple="multiple"
  >
    <template #button="scope">
      <!-- MULTIPLE MODE -->
      <template v-if="multiple">
        <div v-if="getArray().length" class="tw:flex tw:flex-wrap tw:gap-1">
          <NcSeverityBadgeById
            v-for="severityId in getArray()"
            :key="severityId"
            :severityId="severityId"
            :clearable="!required || getArray().length > 1"
            @clear="() => scope.clear(severityId)"
          />
        </div>
        <BaseBadge v-else selectable>Select Severities</BaseBadge>
      </template>

      <!-- SINGLE MODE -->
      <template v-else>
        <NcSeverityBadgeById
          v-if="modelValue"
          :severityId="modelValue"
          :clearable="!required"
          selectable
          @clear="() => scope.clear(modelValue)"
        />
        <BaseBadge v-else selectable>Select Severity</BaseBadge>
      </template>
    </template>
  </BaseSelectMenu>
</template>

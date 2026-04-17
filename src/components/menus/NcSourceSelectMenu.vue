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

const sources = useLiveQuery((db) => db.NcSource.where().exec(), { initial: [] })

function getArray() {
  return Array.isArray(modelValue.value) ? modelValue.value : []
}
</script>

<template>
  <BaseSelectMenu v-model="modelValue" :items="sources" :required="required" :multiple="multiple">
    <template #button="scope">
      <!-- MULTIPLE MODE -->
      <template v-if="multiple">
        <div v-if="getArray().length" class="tw:flex tw:flex-wrap tw:gap-1">
          <NcSourceBadgeById
            v-for="sourceId in getArray()"
            :key="sourceId"
            :sourceId="sourceId"
            :clearable="!required || getArray().length > 1"
            @clear="() => scope.clear(sourceId)"
          />
        </div>
        <BaseBadge v-else selectable>Select Sources</BaseBadge>
      </template>

      <!-- SINGLE MODE -->
      <template v-else>
        <NcSourceBadgeById
          v-if="modelValue"
          :sourceId="modelValue"
          :clearable="!required"
          selectable
          @clear="() => scope.clear(modelValue)"
        />
        <BaseBadge v-else selectable>Select Source</BaseBadge>
      </template>
    </template>
  </BaseSelectMenu>
</template>

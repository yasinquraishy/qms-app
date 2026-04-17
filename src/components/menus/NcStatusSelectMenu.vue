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

const statuses = useLiveQuery((db) => db.NcStatus.where().orderBy('sortOrder', 'asc').exec(), {
  initial: [],
})

function getArray() {
  return Array.isArray(modelValue.value) ? modelValue.value : []
}
</script>

<template>
  <BaseSelectMenu v-model="modelValue" :items="statuses" :required="required" :multiple="multiple">
    <template #button="scope">
      <!-- MULTIPLE MODE -->
      <template v-if="multiple">
        <div v-if="getArray().length" class="tw:flex tw:flex-wrap tw:gap-1">
          <NcStatusBadgeById
            v-for="statusId in getArray()"
            :key="statusId"
            :statusId="statusId"
            :clearable="!required || getArray().length > 1"
            @clear="() => scope.clear(statusId)"
          />
        </div>
        <BaseBadge v-else selectable>Select Statuses</BaseBadge>
      </template>

      <!-- SINGLE MODE -->
      <template v-else>
        <NcStatusBadgeById
          v-if="modelValue"
          :statusId="modelValue"
          :clearable="!required"
          selectable
          @clear="() => scope.clear(modelValue)"
        />
        <BaseBadge v-else selectable>Select Status</BaseBadge>
      </template>
    </template>
  </BaseSelectMenu>
</template>

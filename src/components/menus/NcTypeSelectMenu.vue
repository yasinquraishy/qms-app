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

const types = useLiveQuery((db) => db.NcType.where().exec(), { initial: [] })

function getArray() {
  return Array.isArray(modelValue.value) ? modelValue.value : []
}
</script>

<template>
  <BaseSelectMenu v-model="modelValue" :items="types" :required="required" :multiple="multiple">
    <template #button="scope">
      <!-- MULTIPLE MODE -->
      <template v-if="multiple">
        <div v-if="getArray().length" class="tw:flex tw:flex-wrap tw:gap-1">
          <NcTypeBadgeById
            v-for="typeId in getArray()"
            :key="typeId"
            :typeId="typeId"
            :clearable="!required || getArray().length > 1"
            @clear="() => scope.clear(typeId)"
          />
        </div>
        <BaseBadge v-else selectable>Select Types</BaseBadge>
      </template>

      <!-- SINGLE MODE -->
      <template v-else>
        <NcTypeBadgeById
          v-if="modelValue"
          :typeId="modelValue"
          :clearable="!required"
          selectable
          @clear="() => scope.clear(modelValue)"
        />
        <BaseBadge v-else selectable>Select Type</BaseBadge>
      </template>
    </template>
  </BaseSelectMenu>
</template>

<script setup>
defineProps({
  required: {
    type: Boolean,
    default: false,
  },
})

const modelValue = defineModel({
  type: [String, null],
  default: null,
})

const modules = useLiveQuery((db) => db.Module.where().orderBy('displayOrder').exec(), {
  initial: [],
})

function getModule(id) {
  return modules.value.find((m) => m.id === id) ?? null
}
</script>

<template>
  <BaseSelectMenu v-model="modelValue" :items="modules" :required="required">
    <template #button="scope">
      <slot name="button" v-bind="scope">
        <BaseBadge
          v-if="modelValue"
          :clearable="!required"
          selectable
          @clear="() => scope.clear(modelValue)"
        >
          {{ getModule(modelValue)?.name ?? modelValue }}
        </BaseBadge>
        <span v-else class="tw:text-sm tw:font-medium tw:text-placeholder">Select Module</span>
      </slot>
    </template>
  </BaseSelectMenu>
</template>

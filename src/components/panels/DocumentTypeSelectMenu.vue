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

const documentTypes = useLiveQuery((db) => db.DocumentType.where().orderBy('displayOrder').exec(), {
  initial: [],
})

function getArray() {
  return Array.isArray(modelValue.value) ? modelValue.value : []
}

function getName(id) {
  return documentTypes.value.find((dt) => dt.id === id)?.name || id
}
</script>

<template>
  <BaseSelectMenu
    v-model="modelValue"
    :items="documentTypes"
    :required="required"
    :multiple="multiple"
  >
    <template #button="scope">
      <!-- MULTIPLE MODE -->
      <template v-if="multiple">
        <div v-if="getArray().length" class="tw:flex tw:flex-wrap tw:gap-1">
          <span
            v-for="id in getArray()"
            :key="id"
            class="tw:inline-flex tw:items-center tw:gap-1 tw:text-xs tw:font-medium tw:bg-primary/10 tw:text-primary tw:rounded-full tw:px-2 tw:py-0.5"
          >
            {{ getName(id) }}
            <button
              v-if="!required || getArray().length > 1"
              class="tw:cursor-pointer tw:opacity-60 tw:hover:opacity-100"
              @click.stop="scope.clear(id)"
            >
              ×
            </button>
          </span>
        </div>
        <span v-else class="tw:text-sm tw:font-medium tw:text-placeholder">
          Select Document Types
        </span>
      </template>

      <!-- SINGLE MODE -->
      <template v-else>
        <span v-if="modelValue" class="tw:text-sm tw:font-medium tw:text-on-main">
          {{ getName(modelValue) }}
        </span>
        <span v-else class="tw:text-sm tw:font-medium tw:text-placeholder">
          Select Document Type
        </span>
      </template>
    </template>
  </BaseSelectMenu>
</template>

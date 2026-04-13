<script setup>
const props = defineProps({
  required: {
    type: Boolean,
    default: false,
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  siteId: {
    type: [String, null],
    default: null,
  },
})

const modelValue = defineModel({
  type: [String, Array, null],
  default: null,
})

const departments = useLiveQueryWithDeps(
  [() => props.siteId],
  async (db, [siteId]) => {
    if (siteId) return db.Department.where('siteId', siteId).exec()
    return db.Department.where().exec()
  },
  { initial: [] },
)

/**
 * Normalize model for easier handling
 */
function getArray() {
  return Array.isArray(modelValue.value) ? modelValue.value : []
}
</script>

<template>
  <BaseSelectMenu
    v-model="modelValue"
    :items="departments"
    :required="required"
    :multiple="multiple"
  >
    <template #button="scope">
      <slot name="button" v-bind="scope">
        <!-- MULTIPLE MODE -->
        <template v-if="multiple">
          <div v-if="getArray().length" class="tw:flex tw:flex-wrap tw:gap-1">
            <DepartmentBadgeById
              v-for="id in getArray()"
              :key="id"
              :departmentId="id"
              :clearable="!required || getArray().length > 1"
              @clear="() => scope.clear(id)"
            />
          </div>

          <span v-else class="tw:text-sm tw:font-medium tw:text-placeholder">
            Select Departments
          </span>
        </template>

        <!-- SINGLE MODE -->
        <template v-else>
          <DepartmentBadgeById
            v-if="modelValue"
            :departmentId="modelValue"
            :clearable="!required"
            selectable
            @clear="() => scope.clear(modelValue)"
          />
          <span v-else class="tw:text-sm tw:font-medium tw:text-placeholder">
            Select Department
          </span>
        </template>
      </slot>
    </template>
  </BaseSelectMenu>
</template>

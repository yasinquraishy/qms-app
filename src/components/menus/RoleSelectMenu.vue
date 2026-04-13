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

const roles = useLiveQuery(async (db) => db.Role.where().exec(), { initial: [] })

function getArray() {
  return Array.isArray(modelValue.value) ? modelValue.value : []
}
</script>

<template>
  <BaseSelectMenu v-model="modelValue" :items="roles" :required="required" :multiple="multiple">
    <template #button="scope">
      <slot name="button" v-bind="scope">
        <!-- MULTIPLE MODE -->
        <template v-if="multiple">
          <div v-if="getArray().length" class="tw:flex tw:flex-wrap tw:gap-1">
            <RoleBadgeById
              v-for="roleId in getArray()"
              :key="roleId"
              :roleId="roleId"
              :clearable="!required || getArray().length > 1"
              @clear="() => scope.clear(roleId)"
            />
          </div>
          <span v-else class="tw:text-sm tw:font-medium tw:text-placeholder"> Select Roles </span>
        </template>

        <!-- SINGLE MODE -->
        <template v-else>
          <RoleBadgeById
            v-if="modelValue"
            :roleId="modelValue"
            :clearable="!required"
            selectable
            @clear="() => scope.clear(modelValue)"
          />
          <span v-else class="tw:text-sm tw:font-medium tw:text-placeholder"> Select Role </span>
        </template>
      </slot>
    </template>
  </BaseSelectMenu>
</template>

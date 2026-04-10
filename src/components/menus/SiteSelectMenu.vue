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

const sites = useLiveQuery((db) => db.Site.where().exec(), { initial: [] })

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
    :items="sites"
    :required="required"
    :multiple="multiple"
  >
    <template #button="scope">
      <slot name="button" v-bind="scope">
        <!-- MULTIPLE MODE -->
        <template v-if="multiple">
          <div v-if="getArray().length" class="tw:flex tw:flex-wrap tw:gap-1">
            <SiteBadgeById
              v-for="siteId in getArray()"
              :key="siteId"
              :siteId="siteId"
              :clearable="!required || getArray().length > 1"
              @clear="() => scope.clear(siteId)"
            />
          </div>
          <span v-else class="tw:text-sm tw:font-medium tw:text-placeholder">
            Select Sites
          </span>
        </template>

        <!-- SINGLE MODE -->
        <template v-else>
          <SiteBadgeById
            v-if="modelValue"
            :siteId="modelValue"
            :clearable="!required"
            selectable
            @clear="() => scope.clear(modelValue)"
          />
          <span v-else class="tw:text-sm tw:font-medium tw:text-placeholder">
            Select Site
          </span>
        </template>
      </slot>
    </template>
  </BaseSelectMenu>
</template>

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

// Map sites to { id, name } format for BaseSelectMenu
const items = computed(() => {
  return sites.value.map((site) => ({
    id: site.id,
    name: `${site.name} (${site.code})`,
  }))
})

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
    :items="items"
    :required="required"
    :multiple="multiple"
  >
    <template #button="scope">
      <slot name="button" v-bind="scope">
        <!-- MULTIPLE MODE -->
        <template v-if="multiple">
          <div v-if="getArray().length" class="tw:flex tw:flex-wrap tw:gap-1">
            <SiteBadgeById
              v-for="id in getArray()"
              :key="id"
              :siteId="id"
              :clearable="!required || getArray().length > 1"
              @clear="() => scope.clear(id)"
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

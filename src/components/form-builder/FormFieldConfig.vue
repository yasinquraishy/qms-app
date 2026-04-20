<script setup>
import { IconHandClick } from '@tabler/icons-vue'
import { computed } from 'vue'
import {
  TYPE_SETTINGS_TYPES,
  NUMBER_TYPES,
  OPTIONS_TYPES,
  COL_CLASS_OPTIONS,
  DATETIME_MODE_OPTIONS,
} from '@/constants/formBuilderConfig'

defineProps({
  path: {
    type: String,
    default: null,
  },
})

const field = defineModel('field', {
  type: Object,
  default: () => ({}),
})

const hasTypeSettings = computed(() => TYPE_SETTINGS_TYPES.has(field.value?.type))
const isNumberType = computed(() => NUMBER_TYPES.has(field.value?.type))
const hasOptions = computed(() => OPTIONS_TYPES.has(field.value?.type))

const colClassItems = computed(() =>
  COL_CLASS_OPTIONS.map((opt) => ({ id: opt.value, name: opt.label })),
)

const datetimeModeItems = computed(() =>
  DATETIME_MODE_OPTIONS.map((opt) => ({ id: opt.value, name: opt.label })),
)

function updateRowColClass(value) {
  field.value.colClass = value
  if (field.value.children) {
    field.value.children.forEach((child) => {
      child.class = value
    })
  }
}
</script>

<template>
  <div>
    <div
      v-if="!field"
      class="tw:flex tw:flex-col tw:items-center tw:justify-center tw:p-6 tw:text-center"
    >
      <IconHandClick :size="40" class="tw:text-secondary/40 tw:mb-4" />
      <div class="tw:text-sm tw:text-secondary">Select a field to configure</div>
    </div>

    <div v-else class="tw:p-3 tw:flex tw:flex-col tw:gap-6 tw:h-full">
      <!-- Basic Settings -->
      <ConfigBasic v-model:field="field" />

      <!-- State Settings -->
      <ConfigState v-model:field="field" />

      <div v-if="hasTypeSettings" class="tw:mb-4 tw:last:mb-0">
        <div
          class="tw:font-semibold tw:text-xs tw:uppercase tw:tracking-wide tw:text-secondary tw:mb-3 tw:pb-2 tw:border-b tw:border-divider"
        >
          {{ field.type }} Settings
        </div>

        <!-- Number/Slider Settings -->
        <template v-if="isNumberType">
          <div class="tw:grid tw:grid-cols-3 tw:gap-3">
            <BaseTextInput v-model.number="field.min" type="number" label="Min" size="sm" />
            <BaseTextInput v-model.number="field.max" type="number" label="Max" size="sm" />
            <BaseTextInput v-model.number="field.step" type="number" label="Step" size="sm" />
          </div>
        </template>

        <!-- Select/Radio/OptionGroup Settings -->
        <ConfigOptions v-if="hasOptions" v-model:field="field" />

        <!-- File Settings -->
        <ConfigFile v-if="field.type === 'file'" v-model:field="field" />

        <!-- Rating Settings -->
        <template v-if="field.type === 'rating'">
          <BaseTextInput v-model.number="field.max" type="number" label="Max Stars" />
        </template>

        <!-- Section Settings -->
        <template v-if="field.type === 'section'">
          <div class="tw:flex tw:flex-col tw:gap-3">
            <BaseCheckbox v-model="field.collapsible">Collapsible</BaseCheckbox>
            <BaseCheckbox v-if="field.collapsible" v-model="field.collapsed">
              Start collapsed
            </BaseCheckbox>
          </div>
        </template>

        <!-- Row Settings -->
        <template v-if="field.type === 'row'">
          <BaseSelectMenu
            :modelValue="field.colClass"
            :items="colClassItems"
            :required="true"
            @update:modelValue="updateRowColClass"
          >
            <template #button>
              <span class="tw:text-sm tw:font-medium">
                {{
                  colClassItems.find((i) => i.id === field.colClass)?.name || 'Select Item Width'
                }}
              </span>
            </template>
          </BaseSelectMenu>
          <p class="tw:text-xs tw:text-secondary tw:mt-1">
            Sets the width for all items in this row
          </p>
        </template>

        <template v-if="field.type === 'repeater'">
          <div class="tw:flex tw:flex-col tw:gap-3">
            <div class="tw:grid tw:grid-cols-2 tw:gap-3">
              <BaseTextInput v-model.number="field.minItems" type="number" label="Min Items" />
              <BaseTextInput v-model.number="field.maxItems" type="number" label="Max Items" />
            </div>
            <BaseTextInput v-model="field.addLabel" label="Add Button Label" />
            <BaseTextInput v-model="field.itemLabel" label="Item Label" />
          </div>
        </template>

        <!-- Checklist Settings -->
        <ConfigChecklist v-if="field.type === 'checklist'" v-model:field="field" />

        <!-- Datetime Settings -->
        <template v-if="field.type === 'datetime'">
          <BaseSelectMenu v-model="field.mode" :items="datetimeModeItems" :required="true">
            <template #button>
              <span class="tw:text-sm tw:font-medium">
                {{ datetimeModeItems.find((i) => i.id === field.mode)?.name || 'Select Mode' }}
              </span>
            </template>
          </BaseSelectMenu>
          <p class="tw:text-xs tw:text-secondary tw:mt-1">Format for date/time selection</p>
        </template>
      </div>

      <!-- Styling -->
      <ConfigStyling v-model:field="field" />
    </div>
  </div>
</template>

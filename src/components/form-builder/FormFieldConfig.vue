<script setup>
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

function updateRowColClass(value) {
  // Update the row's own property
  field.value.colClass = value

  // Update all children's class property
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
      <WIcon icon="touch_app" size="40px" class="tw:text-secondary/40 tw:mb-4" />
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
            <WInput v-model.number="field.min" type="number" label="Min" dense />
            <WInput v-model.number="field.max" type="number" label="Max" dense />
            <WInput v-model.number="field.step" type="number" label="Step" dense />
          </div>
        </template>

        <!-- Select/Radio/OptionGroup Settings -->
        <ConfigOptions v-if="hasOptions" v-model:field="field" />

        <!-- File Settings -->
        <ConfigFile v-if="field.type === 'file'" v-model:field="field" />

        <!-- Rating Settings -->
        <template v-if="field.type === 'rating'">
          <WInput v-model.number="field.max" type="number" label="Max Stars" />
        </template>

        <!-- Section Settings -->
        <template v-if="field.type === 'section'">
          <div class="tw:flex tw:flex-col tw:gap-3">
            <QCheckbox v-model="field.collapsible" label="Collapsible" dense />
            <QCheckbox
              v-if="field.collapsible"
              v-model="field.collapsed"
              label="Start collapsed"
              dense
            />
          </div>
        </template>

        <!-- Row Settings -->
        <template v-if="field.type === 'row'">
          <WSelect
            :modelValue="field.colClass"
            :options="COL_CLASS_OPTIONS"
            label="Item Width"
            emitValue
            mapOptions
            optionLabel="label"
            optionValue="value"
            hint="Sets the width for all items in this row"
            @update:modelValue="updateRowColClass"
          />
        </template>

        <template v-if="field.type === 'repeater'">
          <div class="tw:flex tw:flex-col tw:gap-3">
            <div class="tw:grid tw:grid-cols-2 tw:gap-3">
              <WInput v-model.number="field.minItems" type="number" label="Min Items" />
              <WInput v-model.number="field.maxItems" type="number" label="Max Items" />
            </div>
            <WInput v-model="field.addLabel" label="Add Button Label" />
            <WInput v-model="field.itemLabel" label="Item Label" />
          </div>
        </template>

        <!-- Checklist Settings -->
        <ConfigChecklist v-if="field.type === 'checklist'" v-model:field="field" />

        <!-- Datetime Settings -->
        <template v-if="field.type === 'datetime'">
          <WSelect
            v-model="field.mode"
            :options="DATETIME_MODE_OPTIONS"
            label="Display Mode"
            emitValue
            mapOptions
            optionLabel="label"
            optionValue="value"
            hint="Format for date/time selection"
          />
        </template>
      </div>

      <!-- Styling -->
      <ConfigStyling v-model:field="field" />
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { GROUP_TYPE_OPTIONS } from '@/constants/formBuilderConfig'
import { useOptionSets } from '@/composables/useOptionSets.js'

const field = defineModel('field', {
  type: Object,
  required: true,
})

const { optionSets, fetchOptionSets } = useOptionSets()

// Initialize toggle based on whether optionSetId is already set
const useCustomOptions = ref(!field.value.optionSetId)

// Define options for fallback (empty)
if (!field.value.options) {
  field.value.options = []
}

onMounted(() => {
  fetchOptionSets()
})

watch(useCustomOptions, (val) => {
  if (val) {
    // Switching to Custom -> Clear Option Set ID
    field.value.optionSetId = null
  } else {
    // Switching to Option Set -> Clear Custom Options (optional, but cleaner)
    field.value.options = []
  }
})

function addOption() {
  if (!field.value.options) {
    field.value.options = []
  }
  // Simplified to string
  field.value.options.push('')
}

function removeOption(index) {
  field.value.options.splice(index, 1)
}
</script>

<template>
  <div>
    <div v-if="field.type === 'optionGroup'" class="tw:mb-4">
      <div class="tw:flex tw:flex-col tw:gap-3">
        <WSelect
          v-model="field.groupType"
          :options="GROUP_TYPE_OPTIONS"
          label="Display Type"
          emitValue
          mapOptions
          optionLabel="label"
          optionValue="value"
        />
        <QCheckbox v-model="field.inline" label="Horizontal Alignment" dense />
      </div>
    </div>
    <!-- Option Source Toggle -->
    <div class="tw:mb-4">
      <QCheckbox v-model="useCustomOptions" label="Use Custom Options" dense />
    </div>

    <!-- Option Set Selector -->
    <div v-if="!useCustomOptions" class="tw:mb-4">
      <WSelect
        v-model="field.optionSetId"
        :options="optionSets"
        label="Select Option Set"
        optionLabel="name"
        optionValue="id"
        emitValue
        mapOptions
      />
    </div>

    <!-- Custom Options Manager -->
    <div v-else class="tw:flex tw:flex-col tw:gap-3">
      <div class="ds-label-sm tw:text-secondary">Options</div>
      <div
        v-for="(option, index) in field.options"
        :key="index"
        class="tw:bg-main-hover tw:p-2 tw:rounded-lg"
      >
        <div class="tw:flex tw:gap-2 tw:items-center">
          <div class="tw:flex-1">
            <WInput v-model="field.options[index]" placeholder="Option" dense />
          </div>
          <WBtn
            flat
            round
            dense
            size="sm"
            icon="sym_o_delete"
            color="negative"
            @click="removeOption(index)"
          />
        </div>
      </div>
      <WBtn
        flat
        dense
        icon="sym_o_add"
        label="Add Option"
        color="primary"
        class="tw:mt-1 tw:self-start"
        @click="addOption"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>

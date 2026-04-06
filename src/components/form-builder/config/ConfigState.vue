<script setup>
import { computed } from 'vue'
import { NO_STATE_TYPES } from '@/constants/formBuilderConfig'

const field = defineModel('field', {
  type: Object,
  required: true,
})

const hasState = computed(() => !NO_STATE_TYPES.has(field.value.type))
</script>

<template>
  <div v-if="hasState" class="tw:mb-4 tw:last:mb-0">
    <div
      class="tw:font-semibold tw:text-xs tw:uppercase tw:tracking-wide tw:text-secondary tw:mb-2 tw:pb-2 tw:border-b tw:border-divider"
    >
      State
    </div>

    <div class="tw:grid tw:grid-cols-3 tw:gap-2">
      <div>
        <QCheckbox v-model="field.required" label="Required" dense />
      </div>
      <div>
        <QCheckbox v-model="field.readonly" label="Readonly" dense />
      </div>
      <div>
        <QCheckbox v-model="field.disabled" label="Disabled" dense />
      </div>
    </div>
  </div>
</template>

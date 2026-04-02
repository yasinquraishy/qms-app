<script setup>
import DynamicForm from '@/components/form/DynamicForm.js'
import { useQuasar } from 'quasar'

const props = defineProps({
  schema: {
    type: Array,
    default: () => [],
  },
  title: {
    type: String,
    default: 'Form Preview',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  maxWidth: {
    type: String,
    default: '800px',
  },
  submitLabel: {
    type: String,
    default: 'Submit',
  },
  modelValue: {
    type: Object,
    default: () => ({}),
  },
  readonly: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit', 'close', 'update:modelValue'])

const $q = useQuasar()
const formData = ref({})

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      formData.value = { ...newVal }
    }
  },
  { immediate: true, deep: true },
)

function handleSubmit(data) {
  if (props.readonly) return
  emit('submit', data)
  $q.notify({
    type: 'positive',
    message: 'Form submitted successfully!',
    caption: 'Check console for form data',
  })
  console.info('Form Data:', data)
}

function handleClose() {
  emit('close')
}
</script>

<template>
  <QCard class="tw:flex tw:flex-col tw:h-full tw:flex-nowrap">
    <QCardSection class="tw:flex tw:items-center tw:border-b tw:border-divider tw:py-3">
      <div class="tw:flex tw:flex-col">
        <div class="tw:text-lg tw:font-medium tw:text-on-main">{{ title }}</div>
      </div>
      <QSpace />
      <WBtn flat round dense icon="close" @click="handleClose" />
    </QCardSection>

    <QCardSection class="tw:flex-1 tw:p-0 tw:overflow-auto tw:bg-sidebar">
      <div v-if="loading" class="tw:flex tw:flex-col tw:items-center tw:justify-center tw:h-full">
        <QSpinner color="primary" size="48px" />
        <div class="tw:text-sm tw:text-secondary tw:mt-4">Loading preview...</div>
      </div>

      <div
        v-else-if="!schema || schema.length === 0"
        class="tw:flex tw:flex-col tw:items-center tw:justify-center tw:h-full"
      >
        <WIcon name="description" size="48px" color="grey-4" />
        <div class="tw:text-lg tw:text-secondary tw:mt-4">No fields defined in this template</div>
      </div>

      <div v-else class="tw:p-5 tw:min-h-full">
        <QCard flat bordered class="tw:mx-auto" :style="{ maxWidth: maxWidth }">
          <QCardSection>
            <DynamicForm
              v-model="formData"
              :fields="schema"
              :readonly="readonly"
              @submit="handleSubmit"
            >
              <template #footer>
                <div v-if="!readonly" class="tw:flex tw:justify-end tw:mt-4">
                  <WBtn type="submit" color="primary" :label="submitLabel" />
                </div>
              </template>
            </DynamicForm>
          </QCardSection>
        </QCard>
      </div>
    </QCardSection>
  </QCard>
</template>

<style scoped lang="scss">
// Removed custom style as spacing and overflow are handled by Tailwind
</style>

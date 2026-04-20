<script setup>
import { IconX, IconFileDescription } from '@tabler/icons-vue'
import DynamicForm from '@/components/form/DynamicForm.js'

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

const toast = useToast()
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
  toast.notify({
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
  <div class="tw:flex tw:flex-col tw:h-full tw:flex-nowrap">
    <div class="tw:flex tw:items-center tw:border-b tw:border-divider tw:py-3 tw:px-4">
      <div class="tw:flex tw:flex-col">
        <div class="tw:text-lg tw:font-medium tw:text-on-main">{{ title }}</div>
      </div>
      <div class="tw:flex-1" />
      <button
        class="tw:p-1 tw:rounded tw:text-secondary tw:hover:bg-main-hover"
        @click="handleClose"
      >
        <IconX :size="20" />
      </button>
    </div>

    <div class="tw:flex-1 tw:p-0 tw:overflow-auto tw:bg-sidebar">
      <div v-if="loading" class="tw:flex tw:flex-col tw:items-center tw:justify-center tw:h-full">
        <BaseSpinner />
        <div class="tw:text-sm tw:text-secondary tw:mt-4">Loading preview...</div>
      </div>

      <div
        v-else-if="!schema || schema.length === 0"
        class="tw:flex tw:flex-col tw:items-center tw:justify-center tw:h-full"
      >
        <IconFileDescription :size="48" class="tw:text-secondary/40" />
        <div class="tw:text-lg tw:text-secondary tw:mt-4">No fields defined in this template</div>
      </div>

      <div v-else class="tw:p-5 tw:min-h-full">
        <div
          class="tw:mx-auto tw:border tw:border-divider tw:rounded-lg tw:bg-main tw:p-4"
          :style="{ maxWidth: maxWidth }"
        >
          <DynamicForm
            v-model="formData"
            :fields="schema"
            :readonly="readonly"
            @submit="handleSubmit"
          >
            <template #footer>
              <div v-if="!readonly" class="tw:flex tw:justify-end tw:mt-4">
                <BaseButton type="submit">{{ submitLabel }}</BaseButton>
              </div>
            </template>
          </DynamicForm>
        </div>
      </div>
    </div>
  </div>
</template>

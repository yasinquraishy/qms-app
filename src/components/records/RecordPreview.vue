<script setup>
import { currentCompany } from '@/utils/currentCompany.js'
import { get } from '@/api'

const props = defineProps({
  recordId: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['close'])

const loading = ref(true)
const error = ref(null)
const record = ref(null)

const recordTitle = computed(() => {
  if (!record.value) return 'Record Preview'
  return `${record.value.template?.title || 'Record'} - ${record.value.recordNumber}`
})

const schema = computed(() => {
  return record.value?.template?.schema || []
})

const payload = computed(() => {
  return record.value?.payload || {}
})

async function fetchRecord() {
  error.value = null
  const data = await get(`/v1/services/records/${props.recordId}`, {
    params: { companyId: currentCompany.value.id },
    loader: loading,
  })
  record.value = data.record
}

function handleClose() {
  emit('close')
}

onMounted(() => {
  if (props.recordId) {
    fetchRecord()
  }
})
</script>

<template>
  <div class="tw:w-full tw:h-full tw:bg-sidebar">
    <div
      v-if="error"
      class="tw:flex tw:flex-col tw:items-center tw:justify-center tw:h-full tw:text-bad tw:p-6"
    >
      <WIcon name="error_outline" size="48px" class="tw:mb-4" />
      <div class="tw:text-xl tw:font-bold">{{ error }}</div>
      <WBtn flat label="Close" color="primary" class="tw:mt-4" @click="handleClose" />
    </div>

    <FormTemplatePreview
      v-else
      :schema="schema"
      :modelValue="payload"
      :title="recordTitle"
      :loading="loading"
      readonly
      maxWidth="900px"
      @close="handleClose"
    />
  </div>
</template>

<style lang="scss" scoped>
// Removed custom style as overflow and width are handled by parent components/Tailwind
</style>

<script setup>
import { useQuasar } from 'quasar'
import { currentCompany } from '@/utils/currentCompany.js'
import { post } from '@/api'

const props = defineProps({
  request: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['submitted'])

const show = defineModel({ type: Boolean, default: false })

const $q = useQuasar()

const uploadedAssets = ref([])
const submitting = ref(false)

watch(show, (val) => {
  if (val) {
    uploadedAssets.value = []
  }
})

const uploadedAsset = computed(() => uploadedAssets.value[0] ?? null)

async function onSubmit() {
  const companyId = currentCompany.value?.id
  if (!companyId || !uploadedAsset.value || !props.request) return

  submitting.value = true

  const result = await post(`/v1/services/assetRequests/${props.request.id}/submit`, {
    assetId: uploadedAsset.value.id,
    companyId,
  })

  submitting.value = false

  if (result.error) {
    $q.notify({ type: 'negative', message: result.error })
  } else {
    $q.notify({ type: 'positive', message: 'Asset request submitted successfully' })
    show.value = false
    emit('submitted')
  }
}
</script>

<template>
  <WDialog v-model="show" title="Submit Asset Request" persistent>
    <div class="tw:p-4 tw:space-y-4">
      <!-- Request context -->
      <div v-if="request" class="tw:bg-main-hover tw:rounded-lg tw:p-3 tw:space-y-1">
        <p class="tw:text-sm tw:font-medium tw:text-on-main">{{ request.title }}</p>
        <p v-if="request.requestType" class="tw:text-xs tw:text-secondary">
          {{ request.requestType.name }}
        </p>
      </div>

      <!-- Uploader -->
      <WUploader
        v-model="uploadedAssets"
        label="Upload Document"
        :multiple="false"
        fileType="ASSET"
        accept="image/*,application/pdf,.docx,.doc,.xlsx,.xls,.csv"
      />
    </div>

    <template #actions>
      <WBtn flat label="Cancel" @click="show = false" />
      <WBtn
        color="primary"
        label="Submit"
        unelevated
        :loading="submitting"
        :disable="!uploadedAsset"
        @click="onSubmit"
      />
    </template>
  </WDialog>
</template>

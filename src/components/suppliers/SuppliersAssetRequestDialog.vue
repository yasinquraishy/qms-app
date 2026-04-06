<script setup>
import { useQuasar } from 'quasar'
import { currentCompany } from '@/utils/currentCompany.js'
import { post, put } from '@/api'

const props = defineProps({
  supplierId: {
    type: String,
    required: true,
  },
  editingRequest: {
    type: Object,
    default: null,
  },
  contacts: {
    type: Array,
    default: () => [],
  },
  requestTypes: {
    type: Array,
    default: () => [],
  },
  requestStatuses: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['saved'])

const show = defineModel({ type: Boolean, default: false })

const $q = useQuasar()

const saving = ref(false)

const form = ref({
  requestTypeId: null,
  contactIds: [],
  title: '',
  description: '',
  dueDate: null,
  expiryDate: null,
})

const contactOptions = computed(() =>
  props.contacts.map((c) => ({
    label: c.email || c.phoneNumber || 'No email',
    value: c.id,
  })),
)

watch(show, (val) => {
  if (val) {
    form.value = props.editingRequest
      ? {
          requestTypeId: props.editingRequest.requestTypeId || null,
          contactIds: (props.editingRequest.contacts || []).map((c) => c.id),
          title: props.editingRequest.title,
          description: props.editingRequest.description || '',
          dueDate: props.editingRequest.dueDate || null,
          expiryDate: props.editingRequest.expiryDate || null,
        }
      : {
          requestTypeId: null,
          contactIds: [],
          title: '',
          description: '',
          dueDate: null,
          expiryDate: null,
        }
  }
})

async function onSave() {
  const companyId = currentCompany.value?.id
  if (!companyId) {
    $q.notify({ type: 'negative', message: 'Company not found' })
    return
  }
  if (!form.value.title?.trim()) return
  if (!form.value.contactIds?.length) return

  saving.value = true

  let result
  if (props.editingRequest) {
    result = await put(`/v1/services/assetRequests/${props.editingRequest.id}`, {
      contactIds: form.value.contactIds,
      requestTypeId: form.value.requestTypeId || null,
      title: form.value.title,
      description: form.value.description || null,
      dueDate: form.value.dueDate || null,
      expiryDate: form.value.expiryDate || null,
      companyId,
    })
  } else {
    result = await post('/v1/services/assetRequests', {
      supplierId: props.supplierId,
      contactIds: form.value.contactIds,
      requestTypeId: form.value.requestTypeId || null,
      title: form.value.title,
      description: form.value.description || null,
      dueDate: form.value.dueDate || null,
      expiryDate: form.value.expiryDate || null,
      companyId,
    })
  }

  saving.value = false

  if (result.error) {
    $q.notify({ type: 'negative', message: result.error })
  } else {
    $q.notify({
      type: 'positive',
      message: props.editingRequest ? 'Asset request updated' : 'Asset request created',
    })
    show.value = false
    emit('saved')
  }
}
</script>

<template>
  <WDialog
    v-model="show"
    :title="editingRequest ? 'Edit Asset Request' : 'New Asset Request'"
    persistent
  >
    <div class="tw:p-4 tw:space-y-4">
      <WInput v-model="form.title" label="Title *" outlined dense hideBottomSpace />
      <WSelect
        v-model="form.contactIds"
        :options="contactOptions"
        label="Supplier Contacts *"
        outlined
        dense
        multiple
        emitValue
        mapOptions
        useChips
        hideBottomSpace
        optionLabel="label"
        optionValue="value"
      />
      <WSelect
        v-model="form.requestTypeId"
        :options="requestTypes"
        label="Request Type"
        outlined
        dense
        emitValue
        mapOptions
        clearable
        hideBottomSpace
        optionLabel="label"
        optionValue="value"
      />
      <WDateTimeInput
        v-model="form.dueDate"
        label="Due Date"
        mode="date"
        outlined
        dense
        hideBottomSpace
      />
      <WDateTimeInput
        v-model="form.expiryDate"
        label="Expiry Date"
        mode="date"
        outlined
        dense
        hideBottomSpace
      />
      <WInput
        v-model="form.description"
        label="Description"
        type="textarea"
        outlined
        dense
        hideBottomSpace
        autogrow
      />
    </div>
    <template #actions>
      <WBtn flat label="Cancel" @click="show = false" />
      <WBtn
        color="primary"
        :label="editingRequest ? 'Save' : 'Create'"
        unelevated
        :loading="saving"
        :disable="!form.title?.trim() || !form.contactIds?.length"
        @click="onSave"
      />
    </template>
  </WDialog>
</template>

<script setup>
import { DateTime } from 'luxon'
import { currentCompany } from '@/utils/currentCompany.js'
import { useToast } from '@shared/composables/useToast.js'

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
})

const emit = defineEmits(['saved'])

const show = defineModel({ type: Boolean, default: false })

const toast = useToast()
const saving = ref(false)

const form = ref({
  requestTypeId: null,
  contactIds: [],
  title: '',
  description: '',
  dueDate: null,
  expiryDate: null,
})

const editingContacts = useLiveQueryWithDeps(
  [() => props.editingRequest?.id],
  async (db, [requestId]) => {
    if (!requestId) return []
    return db.AssetRequestOnContact.where('assetRequestId', requestId).exec()
  },
  { initial: [] },
)

watch(show, (val) => {
  if (val) {
    form.value = props.editingRequest
      ? {
          requestTypeId: props.editingRequest.requestTypeId || null,
          contactIds: editingContacts.value.map((c) => c.supplierContactId),
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
          dueDate: currentCompany.value?.settings?.defaultAssetRequestDueDays
            ? DateTime.now().plus({
                days: currentCompany.value.settings.defaultAssetRequestDueDays,
              })
            : null,
          expiryDate: null,
        }
  }
})

function toggleContact(id) {
  const ids = form.value.contactIds
  const idx = ids.indexOf(id)
  if (idx === -1) {
    form.value.contactIds = [...ids, id]
  } else {
    form.value.contactIds = ids.filter((x) => x !== id)
  }
}

const createRequest = useLiveMutation(async (db, payload) => {
  const request = db.AssetRequest.create({
    supplierId: payload.supplierId,
    requestTypeId: payload.requestTypeId || null,
    title: payload.title,
    description: payload.description || null,
    dueDate: payload.dueDate || null,
    expiryDate: payload.expiryDate || null,
    statusId: 'PENDING',
  })
  await request.save()

  for (const contactId of payload.contactIds) {
    const link = db.AssetRequestOnContact.create({
      assetRequestId: request.id,
      supplierContactId: contactId,
    })
    await link.save()
  }

  return request
})

const addContactLink = useLiveMutation(async (db, { assetRequestId, supplierContactId }) => {
  const link = db.AssetRequestOnContact.create({ assetRequestId, supplierContactId })
  await link.save()
  return link
})

async function onSave() {
  if (!form.value.title?.trim()) return
  if (!form.value.contactIds?.length) return

  saving.value = true

  try {
    if (props.editingRequest) {
      props.editingRequest.requestTypeId = form.value.requestTypeId || null
      props.editingRequest.title = form.value.title
      props.editingRequest.description = form.value.description || null
      props.editingRequest.dueDate = form.value.dueDate || null
      props.editingRequest.expiryDate = form.value.expiryDate || null
      await props.editingRequest.save()

      const currentContactIds = editingContacts.value.map((c) => c.supplierContactId)
      const toAdd = form.value.contactIds.filter((id) => !currentContactIds.includes(id))
      const toRemove = editingContacts.value.filter(
        (c) => !form.value.contactIds.includes(c.supplierContactId),
      )

      for (const contactId of toAdd) {
        await addContactLink({
          assetRequestId: props.editingRequest.id,
          supplierContactId: contactId,
        })
      }
      for (const link of toRemove) {
        await link.delete()
      }
    } else {
      await createRequest({
        supplierId: props.supplierId,
        requestTypeId: form.value.requestTypeId,
        title: form.value.title,
        description: form.value.description,
        dueDate: form.value.dueDate,
        expiryDate: form.value.expiryDate,
        contactIds: form.value.contactIds,
      })
    }

    toast.notify({
      type: 'positive',
      message: props.editingRequest ? 'Asset request updated' : 'Asset request created',
    })
    show.value = false
    emit('saved')
  } catch (err) {
    toast.notify({ type: 'negative', message: err.message || 'Failed to save' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <BaseDialog
    v-model="show"
    :title="editingRequest ? 'Edit Asset Request' : 'New Asset Request'"
    :persistent="true"
  >
    <div class="tw:p-4 tw:space-y-4">
      <div>
        <label class="tw:block tw:text-sm tw:font-medium tw:text-on-main tw:mb-1">
          Title <span class="tw:text-red-500">*</span>
        </label>
        <BaseTextInput v-model="form.title" placeholder="Asset request title" />
      </div>

      <div>
        <label class="tw:block tw:text-sm tw:font-medium tw:text-on-main tw:mb-1">
          Supplier Contacts <span class="tw:text-red-500">*</span>
        </label>
        <div
          class="tw:space-y-1 tw:max-h-40 tw:overflow-y-auto tw:rounded-md tw:border tw:border-divider tw:p-2"
        >
          <label
            v-for="contact in contacts"
            :key="contact.id"
            class="tw:flex tw:items-center tw:gap-2 tw:cursor-pointer tw:px-2 tw:py-1 tw:rounded tw:hover:bg-main-hover"
          >
            <BaseCheckbox
              :modelValue="form.contactIds.includes(contact.id)"
              @update:modelValue="toggleContact(contact.id)"
            />
            <span class="tw:text-sm tw:text-on-main">
              {{ contact.email || contact.phoneNumber || 'No email' }}
            </span>
          </label>
          <p v-if="!contacts.length" class="tw:text-sm tw:text-secondary tw:px-2 tw:py-1">
            No contacts available
          </p>
        </div>
      </div>

      <div>
        <label class="tw:block tw:text-sm tw:font-medium tw:text-on-main tw:mb-1">
          Request Type
        </label>
        <AssetRequestTypeSelectMenu v-model="form.requestTypeId" />
      </div>

      <div>
        <label class="tw:block tw:text-sm tw:font-medium tw:text-on-main tw:mb-1">Due Date</label>
        <BaseDatePicker v-model="form.dueDate" />
      </div>

      <div>
        <label class="tw:block tw:text-sm tw:font-medium tw:text-on-main tw:mb-1">
          Expiry Date
        </label>
        <BaseDatePicker v-model="form.expiryDate" />
      </div>

      <div>
        <label class="tw:block tw:text-sm tw:font-medium tw:text-on-main tw:mb-1">
          Description
        </label>
        <BaseTextarea v-model="form.description" placeholder="Optional description" :rows="3" />
      </div>
    </div>

    <div class="tw:flex tw:justify-end tw:gap-2 tw:px-4 tw:pb-4">
      <BaseButton variant="ghost" @click="show = false">Cancel</BaseButton>
      <BaseButton
        :disabled="!form.title?.trim() || !form.contactIds?.length || saving"
        @click="onSave"
      >
        <div
          v-if="saving"
          class="tw:animate-spin tw:rounded-full tw:size-4 tw:border-2 tw:border-white tw:border-t-transparent"
        />
        <span>{{ saving ? 'Saving...' : editingRequest ? 'Save' : 'Create' }}</span>
      </BaseButton>
    </div>
  </BaseDialog>
</template>

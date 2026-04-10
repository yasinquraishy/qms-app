<script setup>
import { IconMail, IconPlus, IconTrash, IconStar, IconStarFilled } from '@tabler/icons-vue'

const props = defineProps({
  supplierId: {
    type: String,
    required: true,
  },
  canUpdate: {
    type: Boolean,
    default: false,
  },
})

const contacts = useLiveQueryWithDeps(
  [() => props.supplierId],
  async (db, [supplierId]) => db.SupplierContact.where('supplierId', supplierId).exec(),
  { initial: [] },
)

const primaryContact = computed(() => {
  if (!contacts.value?.length) return null
  return contacts.value.find((c) => c.isPrimary) || contacts.value[0]
})

const addContact = useLiveMutation(async (db, { supplierId }) => {
  const isFirst = contacts.value.length === 0
  const contact = db.SupplierContact.create({
    supplierId,
    email: '',
    phoneNumber: '',
    isPrimary: isFirst,
  })
  await contact.save()
  return contact
})

async function removeContact(contact) {
  await contact.delete()
}

async function setPrimary(contact) {
  for (const c of contacts.value) {
    if (c.isPrimary && c.id !== contact.id) {
      c.isPrimary = false
      await c.save()
    }
  }
  contact.isPrimary = true
  await contact.save()
}
</script>

<template>
  <div
    class="tw:bg-sidebar tw:rounded-xl tw:shadow-sm tw:border tw:border-divider tw:overflow-hidden"
  >
    <div
      class="tw:px-6 tw:py-4 tw:border-b tw:border-divider tw:bg-main-hover tw:flex tw:items-center tw:justify-between"
    >
      <div class="tw:flex tw:items-center tw:gap-3">
        <div
          class="tw:w-10 tw:h-10 tw:rounded-lg tw:bg-gray-100 tw:flex tw:items-center tw:justify-center"
        >
          <IconMail :size="20" class="tw:text-secondary" />
        </div>
        <h3 class="tw:text-lg tw:font-bold tw:text-on-main">Contact Details</h3>
      </div>
      <BaseButton
        v-if="canUpdate"
        variant="text-link"
        size="sm"
        @click="addContact({ supplierId })"
      >
        <IconPlus :size="14" />
        Add Contact
      </BaseButton>
    </div>
    <div class="tw:p-6">
      <div v-if="contacts.length" class="tw:space-y-4">
        <div
          v-for="contact in contacts"
          :key="contact.id"
          class="tw:flex tw:flex-col tw:gap-3 tw:p-4 tw:border tw:border-divider tw:rounded-lg"
        >
          <div class="tw:flex tw:items-center tw:justify-between">
            <div class="tw:flex tw:items-center tw:gap-2">
              <button
                class="tw:p-0.5 tw:rounded tw:transition-colors"
                :class="
                  contact.isPrimary
                    ? 'tw:text-amber-500'
                    : 'tw:text-secondary tw:hover:text-amber-500'
                "
                :title="contact.isPrimary ? 'Primary' : 'Set as primary'"
                @click="!contact.isPrimary && setPrimary(contact)"
              >
                <IconStarFilled v-if="contact.isPrimary" :size="16" />
                <IconStar v-else :size="16" />
              </button>
              <span class="tw:text-xs tw:font-bold tw:text-secondary tw:uppercase tw:tracking-wide">
                {{ contact.isPrimary ? 'Primary' : 'Contact' }}
              </span>
            </div>
            <button
              v-if="canUpdate && contacts.length > 1"
              class="tw:p-1 tw:rounded tw:text-red-400 tw:hover:text-red-600 tw:transition-colors"
              @click="removeContact(contact)"
            >
              <IconTrash :size="14" />
            </button>
          </div>
          <div class="tw:grid tw:grid-cols-1 tw:md:grid-cols-2 tw:gap-3">
            <div>
              <label class="tw:block tw:text-xs tw:text-secondary tw:mb-1">Email</label>
              <BaseTextInput
                v-if="canUpdate"
                v-model="contact.email"
                placeholder="email@supplier.com"
              />
              <a
                v-else-if="contact.email"
                :href="`mailto:${contact.email}`"
                class="tw:text-primary tw:font-medium tw:text-sm tw:hover:underline"
              >
                {{ contact.email }}
              </a>
              <span v-else class="tw:text-sm tw:text-secondary">—</span>
            </div>
            <div>
              <label class="tw:block tw:text-xs tw:text-secondary tw:mb-1">Phone</label>
              <BaseTextInput
                v-if="canUpdate"
                v-model="contact.phoneNumber"
                placeholder="+1 (555) 000-0000"
              />
              <span v-else class="tw:text-sm tw:font-medium tw:text-on-main">{{
                contact.phoneNumber || '—'
              }}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="tw:py-8 tw:text-center">
        <IconMail :size="40" class="tw:text-secondary/50 tw:mb-2" />
        <p class="tw:text-secondary tw:text-sm">No contact details available.</p>
      </div>
    </div>
  </div>
</template>

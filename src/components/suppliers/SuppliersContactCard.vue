<script setup>
const props = defineProps({
  supplier: {
    type: Object,
    required: true,
  },
})

const primaryContact = computed(() => {
  if (!props.supplier.contacts?.length) return null
  return props.supplier.contacts.find((c) => c.isPrimary) || props.supplier.contacts[0]
})

const hasAddress = computed(() => {
  const s = props.supplier
  return s.streetAddress || s.city || s.stateProvince || s.zipPostalCode || s.country
})

const formattedAddress = computed(() => {
  const s = props.supplier
  const parts = []
  if (s.streetAddress) parts.push(s.streetAddress)
  const cityLine = [s.city, s.stateProvince, s.zipPostalCode].filter(Boolean).join(', ')
  if (cityLine) parts.push(cityLine)
  if (s.country) parts.push(s.country)
  return parts
})
</script>

<template>
  <div
    class="tw:bg-sidebar tw:rounded-xl tw:shadow-sm tw:border tw:border-divider tw:overflow-hidden"
  >
    <div
      class="tw:px-6 tw:py-4 tw:border-b tw:border-divider tw:bg-main-hover tw:flex tw:items-center tw:gap-3"
    >
      <div
        class="tw:w-10 tw:h-10 tw:rounded-lg tw:bg-gray-100 tw:flex tw:items-center tw:justify-center"
      >
        <QIcon name="contact_mail" class="tw:text-secondary" size="sm" />
      </div>
      <h3 class="tw:text-lg tw:font-bold tw:text-on-main">Contact Details</h3>
    </div>
    <div class="tw:p-6">
      <div
        v-if="primaryContact || hasAddress"
        class="tw:grid tw:grid-cols-1 tw:md:grid-cols-3 tw:gap-6"
      >
        <div v-if="primaryContact?.email" class="tw:bg-main-hover tw:p-4 tw:rounded-lg">
          <label class="ds-label-sm tw:text-secondary tw:block tw:mb-2">Primary Email</label>
          <a
            :href="`mailto:${primaryContact.email}`"
            class="tw:text-primary tw:font-medium tw:text-sm tw:hover:underline"
          >
            {{ primaryContact.email }}
          </a>
        </div>
        <div v-if="primaryContact?.phoneNumber" class="tw:bg-main-hover tw:p-4 tw:rounded-lg">
          <label class="ds-label-sm tw:text-secondary tw:block tw:mb-2">Phone Number</label>
          <p class="tw:text-sm tw:font-medium tw:text-on-main">{{ primaryContact.phoneNumber }}</p>
        </div>
        <div v-if="hasAddress" class="tw:bg-main-hover tw:p-4 tw:rounded-lg">
          <label class="ds-label-sm tw:text-secondary tw:block tw:mb-2">Address</label>
          <p class="tw:text-sm tw:font-medium tw:text-on-main tw:leading-tight">
            <template v-for="(line, i) in formattedAddress" :key="i">
              {{ line }}<br v-if="i < formattedAddress.length - 1" />
            </template>
          </p>
        </div>
      </div>
      <div v-else class="tw:py-8 tw:text-center">
        <QIcon name="contact_mail" size="40px" class="tw:text-secondary/50 tw:mb-2" />
        <p class="tw:text-secondary tw:text-sm">No contact details available.</p>
      </div>
    </div>
  </div>
</template>

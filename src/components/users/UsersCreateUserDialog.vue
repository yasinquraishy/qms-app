<script setup>
import { useQuasar } from 'quasar'
import { required, email, helpers } from '@vuelidate/validators'
import { useValidator } from '@shared/composables/validator.js'
import { useUsers } from '@/composables/useUsers.js'
import { useRoles } from '@/composables/useRoles.js'
import WCheckbox from '@shared/components/checkbox/WCheckbox.js'
import WColorPicker from '@shared/components/WColorPicker.vue'

const emit = defineEmits(['created'])

const open = defineModel({
  type: Boolean,
  default: false,
})

const { createUser } = useUsers()
const { roles, loading: loadingRoles } = useRoles()
const $q = useQuasar()

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  roleIds: [],
  color: '#2563eb',
  inviteSent: false,
  siteId: null,
  departmentId: null,
})

const rules = computed(() => ({
  firstName: { required: helpers.withMessage('Required', required) },
  lastName: { required: helpers.withMessage('Required', required) },
  email: {
    required: helpers.withMessage('Required', required),
    email: helpers.withMessage('Invalid email format', email),
  },
}))

const validator = useValidator(rules, form)

const isSubmitting = ref(false)

// Reset form when closed
watch(open, (val) => {
  if (!val) {
    form.value = {
      firstName: '',
      lastName: '',
      email: '',
      roleIds: [],
      color: '#2563eb',
      inviteSent: false,
      siteId: null,
      departmentId: null,
    }
  }
})

async function onSubmit() {
  const valid = await validator.value.$validate()
  if (!valid) return

  isSubmitting.value = true
  const result = await createUser({
    firstName: form.value.firstName,
    lastName: form.value.lastName,
    email: form.value.email,
    roleIds: form.value.roleIds,
    siteId: form.value.siteId,
    departmentId: form.value.departmentId,
    color: form.value.color,
    inviteSent: form.value.inviteSent,
  })
  isSubmitting.value = false

  if (result.error) {
    $q.notify({
      type: 'negative',
      message: result.error,
    })
  } else {
    $q.notify({
      type: 'positive',
      message: 'User created successfully',
    })
    emit('created', result.user)
    open.value = false
  }
}
</script>

<template>
  <WDialog v-model="open" title="Create New User" minWidth="600px">
    <div class="tw:grid tw:grid-cols-12 tw:gap-0">
      <!-- Main Content -->
      <div class="tw:col-span-12 tw:sm:col-span-8 tw:p-4">
        <div class="tw:flex tw:flex-col tw:gap-3">
          <div class="tw:grid tw:grid-cols-2 tw:gap-3">
            <WInput
              v-model="form.firstName"
              name="firstName"
              label="First Name"
              placeholder="e.g. John"
              dense
            >
              <template #label> First Name <span class="tw:text-bad">*</span> </template>
            </WInput>
            <WInput
              v-model="form.lastName"
              name="lastName"
              label="Last Name"
              placeholder="e.g. Doe"
              dense
            >
              <template #label> Last Name <span class="tw:text-bad">*</span> </template>
            </WInput>
          </div>

          <WInput
            v-model="form.email"
            name="email"
            label="Email Address"
            placeholder="e.g. john.doe@example.com"
            type="email"
            dense
          >
            <template #label> Email <span class="tw:text-bad">*</span> </template>
          </WInput>

          <WSelect
            v-model="form.roleIds"
            label="Roles"
            :options="roles"
            optionLabel="name"
            optionValue="id"
            multiple
            :loading="loadingRoles"
            dense
            emitValue
            mapOptions
          >
            <template #label> Roles </template>
            <template #option="{ itemProps, opt }">
              <QItem v-bind="itemProps" class="tw:max-w-134">
                <QItemSection>
                  <QItemLabel>{{ opt.name }}</QItemLabel>
                  <QItemLabel caption class="tw:text-nowrap tw:text-ellipsis tw:overflow-hidden">
                    {{ opt.description }}
                  </QItemLabel>
                </QItemSection>
              </QItem>
            </template>
          </WSelect>

          <UsersSiteSelect v-model:siteId="form.siteId" label="Site" :required="true">
            <template #label> Site </template>
          </UsersSiteSelect>

          <UsersDepartmentSelect
            v-model:departmentId="form.departmentId"
            label="Department"
            :siteId="form.siteId"
            :required="true"
          >
            <template #label> Department </template>
          </UsersDepartmentSelect>
        </div>
      </div>

      <!-- Mini Sidebar -->
      <div class="tw:col-span-12 tw:sm:col-span-4 tw:bg-main-hover tw:p-4 tw:rounded-r-lg">
        <div class="tw:flex tw:flex-col tw:gap-4">
          <div>
            <div class="tw:text-xs tw:text-secondary tw:mb-2 tw:font-medium">User Color</div>
            <WColorPicker v-model="form.color" />
          </div>

          <div class="tw:flex tw:flex-col tw:gap-1">
            <WCheckbox v-model="form.inviteSent" label="Send Invite" dense />
            <div class="tw:text-[10px] tw:text-secondary tw:ml-8">Send an email invitation.</div>
          </div>
        </div>
      </div>
    </div>

    <template #actions>
      <WBtn flat label="Cancel" color="primary" @click="open = false" />
      <WBtn
        label="Create User"
        color="primary"
        unelevated
        :loading="isSubmitting"
        :disable="isSubmitting"
        class="tw:px-6 tw:font-bold"
        @click="onSubmit"
      />
    </template>
  </WDialog>
</template>

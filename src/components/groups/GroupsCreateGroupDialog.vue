<script setup>
import { useQuasar } from 'quasar'
import { required, helpers } from '@vuelidate/validators'
import { useValidator } from '@shared/composables/validator.js'
import { useGroups } from '@/composables/useGroups.js'
import { useUsers } from '@/composables/useUsers.js'
import WColorPicker from '@shared/components/WColorPicker.vue'

const emit = defineEmits(['created'])

const open = defineModel({
  type: Boolean,
  default: false,
})

const { createGroup } = useGroups()
const { users, fetchUsers } = useUsers()
const $q = useQuasar()

const form = ref({
  name: '',
  color: '#6366f1',
  isLeadership: false,
  userIds: [],
})

const rules = computed(() => ({
  name: { required: helpers.withMessage('Required', required) },
}))

const validator = useValidator(rules, form)

const isSubmitting = ref(false)

// Format users for select options
const userOptions = computed(() => {
  return users.value.map((user) => ({
    label: `${user.firstName} ${user.lastName}`,
    value: user.id,
    caption: user.email,
  }))
})

// Fetch users when dialog opens
watch(open, (val) => {
  if (val) {
    fetchUsers()
  } else {
    // Reset form when closed
    form.value = {
      name: '',
      color: '#6366f1',
      isLeadership: false,
      userIds: [],
    }
  }
})

async function onSubmit() {
  const valid = await validator.value.$validate()
  if (!valid) return

  isSubmitting.value = true
  const result = await createGroup({
    name: form.value.name,
    color: form.value.color,
    isLeadership: form.value.isLeadership,
    userIds: form.value.userIds,
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
      message: 'Group created successfully',
    })
    emit('created', result.group)
    open.value = false
  }
}
</script>

<template>
  <WDialog v-model="open" title="Create New Group" minWidth="600px">
    <div class="tw:grid tw:grid-cols-12 tw:gap-0">
      <!-- Main Content -->
      <div class="tw:col-span-12 tw:sm:col-span-8 tw:p-4">
        <div class="tw:flex tw:flex-col tw:gap-3">
          <WInput
            v-model="form.name"
            name="name"
            label="Group Name"
            placeholder="e.g. Quality Assurance Team"
            dense
          >
            <template #label> Group Name <span class="tw:text-bad">*</span> </template>
          </WInput>

          <WSelect
            v-model="form.userIds"
            label="Members"
            :options="userOptions"
            emitValue
            mapOptions
            multiple
            useChips
            dense
            optionLabel="label"
            optionValue="value"
          >
            <template #label> Members </template>
            <template #option="{ itemProps, opt }">
              <QItem v-bind="itemProps">
                <QItemSection>
                  <QItemLabel>{{ opt.label }}</QItemLabel>
                  <QItemLabel caption>{{ opt.caption }}</QItemLabel>
                </QItemSection>
              </QItem>
            </template>
          </WSelect>
        </div>
      </div>

      <!-- Mini Sidebar -->
      <div class="tw:col-span-12 tw:sm:col-span-4 tw:bg-main-hover tw:p-4 tw:rounded-r-lg">
        <div class="tw:flex tw:flex-col tw:gap-4">
          <div>
            <div class="tw:text-xs tw:text-secondary tw:mb-2 tw:font-medium">Group Color</div>
            <WColorPicker v-model="form.color" />
          </div>

          <div class="tw:flex tw:flex-col tw:gap-1">
            <QToggle v-model="form.isLeadership" label="Leadership Team" dense />
            <div class="tw:text-[10px] tw:text-secondary tw:ml-10">Core management group.</div>
          </div>
        </div>
      </div>
    </div>

    <template #actions>
      <WBtn flat label="Cancel" color="primary" @click="open = false" />
      <WBtn
        label="Create Group"
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

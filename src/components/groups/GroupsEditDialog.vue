<script setup>
import { useQuasar } from 'quasar'
import { required, helpers } from '@vuelidate/validators'
import { useValidator } from '@shared/composables/validator.js'
import { useGroups } from '@/composables/useGroups.js'
import { useUsers } from '@/composables/useUsers.js'
import WColorPicker from '@shared/components/WColorPicker.vue'

const props = defineProps({
  groupId: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['updated'])

const open = defineModel({
  type: Boolean,
  default: false,
})

const { getGroup, updateGroup } = useGroups()
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
const isLoading = ref(false)

// Format users for select options
const userOptions = computed(() => {
  return users.value.map((user) => ({
    label: `${user.firstName} ${user.lastName}`,
    value: user.id,
    caption: user.email,
  }))
})

// Load group data when dialog opens
watch(open, async (val) => {
  if (val) {
    await fetchUsers()
    await loadGroupData()
  }
})

async function loadGroupData() {
  isLoading.value = true
  const result = await getGroup(props.groupId)
  isLoading.value = false

  if (result.error) {
    $q.notify({
      type: 'negative',
      message: result.error,
    })
    open.value = false
    return
  }

  if (result.group) {
    const g = result.group
    const userIds = (g.userAssignments || []).map((a) => a.userId || a.user?.id)

    form.value = {
      name: g.name,
      color: g.color || '#6366f1',
      isLeadership: g.isLeadership || false,
      userIds,
    }
  }
}

async function onSubmit() {
  const valid = await validator.value.$validate()
  if (!valid) return

  isSubmitting.value = true
  const result = await updateGroup(props.groupId, {
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
      message: 'Group updated successfully',
    })
    emit('updated', result.group)
    open.value = false
  }
}
</script>

<template>
  <WDialog v-model="open" title="Edit Group" minWidth="600px">
    <div v-if="isLoading" class="tw:flex tw:justify-center tw:p-8">
      <QSpinner color="primary" size="48px" />
    </div>

    <div v-else class="tw:grid tw:grid-cols-12 tw:gap-0">
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
        label="Save Changes"
        color="primary"
        unelevated
        :loading="isSubmitting"
        :disable="isSubmitting || isLoading"
        class="tw:px-6 tw:font-bold"
        @click="onSubmit"
      />
    </template>
  </WDialog>
</template>

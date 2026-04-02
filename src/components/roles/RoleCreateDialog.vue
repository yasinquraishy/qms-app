<script setup>
import { required, helpers } from '@vuelidate/validators'
import { useValidator } from '@shared/composables/validator.js'
import { useRoles } from '@/composables/useRoles.js'

const show = defineModel({ type: Boolean, default: false })

const { roles, createRole } = useRoles()

const form = ref({
  name: '',
  description: '',
  copyFromRoleId: 'custom',
})

const rules = computed(() => ({
  name: { required: helpers.withMessage('Role name is required', required) },
}))

const validator = useValidator(rules, form)

const loading = ref(false)

// Computed options for the "Copy from" select
const copyFromOptions = computed(() => {
  const options = [
    {
      label: 'Custom',
      value: 'custom',
      description: 'Start with no permissions',
    },
    ...roles.value.map((role) => ({
      label: role.name,
      value: role.id,
      description: role.description || 'No description provided',
    })),
  ]

  return options
})

// Get permission IDs from selected role
const selectedRolePermissions = computed(() => {
  if (form.value.copyFromRoleId === 'custom') {
    return []
  }

  const selectedRole = roles.value.find((role) => role.id === form.value.copyFromRoleId)
  if (!selectedRole || !selectedRole.permissionAssignments) {
    return []
  }

  return selectedRole.permissionAssignments.map((pa) => pa.permissionId)
})

async function handleSubmit() {
  const valid = await validator.value.$validate()
  if (!valid) return

  loading.value = true
  try {
    const payload = {
      name: form.value.name.trim(),
      description: form.value.description.trim() || '',
      statusId: 'ACTIVE',
      permissionIds: selectedRolePermissions.value,
    }

    const result = await createRole(payload)

    if (result.success) {
      show.value = false
      form.value = {
        name: '',
        description: '',
        copyFromRoleId: 'custom',
      }
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <QDialog v-model="show" transitionShow="scale" transitionHide="scale">
    <div class="tw:bg-main tw:rounded-2xl tw:overflow-hidden tw:shadow-2xl tw:max-w-md tw:w-full">
      <div class="tw:p-5 tw:flex tw:flex-col tw:gap-4">
        <div class="tw:flex tw:items-center tw:gap-3">
          <div
            class="tw:w-10 tw:h-10 tw:bg-primary/10 tw:text-primary tw:rounded-xl tw:flex tw:items-center tw:justify-center"
          >
            <WIcon icon="add_circle" size="24px" />
          </div>
          <div class="tw:text-2xl tw:font-bold tw:text-on-main">Create Role</div>
        </div>

        <div class="tw:text-sm tw:text-secondary tw:leading-relaxed">
          Define a new role with specific permissions to control access to features and data.
        </div>

        <QForm class="tw:flex tw:flex-col tw:gap-4" @submit="handleSubmit">
          <WInput
            v-model="form.name"
            name="name"
            label="Role Name"
            placeholder="e.g., Field Supervisor"
            autofocus
          />

          <WInput
            v-model="form.description"
            label="Description"
            placeholder="Describe the purpose and responsibilities of this role"
            type="textarea"
            class="tw:min-h-24"
          />

          <WSelect
            v-model="form.copyFromRoleId"
            label="Copy From"
            :options="copyFromOptions"
            optionLabel="label"
            optionValue="value"
            emitValue
            mapOptions
          >
            <template #option="scope">
              <QItem v-bind="scope.itemProps" class="tw:max-w-130">
                <QItemSection>
                  <QItemLabel>{{ scope.opt.label }}</QItemLabel>
                  <QItemLabel
                    caption
                    class="tw:text-xs tw:text-secondary tw:text-ellipsis! tw:text-nowrap tw:overflow-hidden"
                  >
                    {{ scope.opt.description }}
                  </QItemLabel>
                </QItemSection>
              </QItem>
            </template>
          </WSelect>

          <div
            v-if="form.copyFromRoleId !== 'custom'"
            class="tw:text-xs tw:text-secondary tw:bg-primary/5 tw:p-3 tw:rounded-lg"
          >
            <div class="tw:flex tw:items-center tw:gap-2">
              <WIcon icon="info" size="16px" class="tw:text-primary" />
              <span>
                {{ selectedRolePermissions.length }} permission{{
                  selectedRolePermissions.length !== 1 ? 's' : ''
                }}
                will be copied from the selected role
              </span>
            </div>
          </div>
        </QForm>

        <div class="tw:flex tw:justify-end tw:gap-3 tw:mt-2">
          <WBtn flat label="Cancel" color="grey-7" @click="show = false" />
          <WBtn
            label="Create Role"
            color="primary"
            unelevated
            class="tw:px-6 tw:font-bold"
            :loading="loading"
            @click="handleSubmit"
          />
        </div>
      </div>
    </div>
  </QDialog>
</template>

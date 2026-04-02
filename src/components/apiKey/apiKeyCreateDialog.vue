<script setup>
import { useQuasar, copyToClipboard } from 'quasar'
import { required, helpers } from '@vuelidate/validators'
import { useValidator } from '@shared/composables/validator.js'

const show = defineModel({ type: Boolean, default: false })

const { createApiKey } = useApiKeys()
const $q = useQuasar()

const form = ref({
  name: '',
  label: '',
  expiresAt: null,
})

const rules = computed(() => ({
  name: { required: helpers.withMessage('Name is required', required) },
}))

const validator = useValidator(rules, form)

const loading = ref(false)
const createdKey = ref(null)

async function handleSubmit() {
  const valid = await validator.value.$validate()
  if (!valid) return

  loading.value = true
  try {
    const result = await createApiKey({
      name: form.value.name.trim(),
      label: form.value.label.trim() || null,
      expiresAt: form.value.expiresAt || null,
    })

    if (result?.key) {
      createdKey.value = result.key
    } else {
      resetAndClose()
      $q.notify({ type: 'positive', message: 'API key created successfully' })
    }
  } finally {
    loading.value = false
  }
}

function handleCopyKey() {
  if (createdKey.value) {
    copyToClipboard(createdKey.value)
    $q.notify({ type: 'positive', message: 'API key copied to clipboard' })
  }
}

function resetAndClose() {
  form.value = { name: '', label: '', expiresAt: null }
  createdKey.value = null
  show.value = false
}
</script>

<template>
  <QDialog v-model="show" transitionShow="scale" transitionHide="scale" @hide="createdKey = null">
    <div class="tw:bg-main tw:rounded-2xl tw:overflow-hidden tw:shadow-2xl tw:max-w-md tw:w-full">
      <div class="tw:p-5 tw:flex tw:flex-col tw:gap-4">
        <!-- Header -->
        <div class="tw:flex tw:items-center tw:gap-3">
          <div
            class="tw:w-10 tw:h-10 tw:bg-primary/10 tw:text-primary tw:rounded-xl tw:flex tw:items-center tw:justify-center"
          >
            <WIcon icon="key" size="24px" />
          </div>
          <div class="tw:text-2xl tw:font-bold tw:text-on-main">
            {{ createdKey ? 'API Key Created' : 'Create API Key' }}
          </div>
        </div>

        <!-- Create Form -->
        <template v-if="!createdKey">
          <div class="tw:text-sm tw:text-secondary tw:leading-relaxed">
            Create a new API key for programmatic access to your company data.
          </div>

          <QForm class="tw:flex tw:flex-col tw:gap-4" @submit="handleSubmit">
            <WInput
              v-model="form.name"
              name="name"
              label="Name"
              placeholder="e.g., CI/CD Pipeline"
              autofocus
            />
            <WInput
              v-model="form.label"
              label="Label"
              placeholder="e.g., Production deployment key"
            />
            <WDateTimeInput
              v-model="form.expiresAt"
              label="Expires At"
              mode="date"
              hint="Leave empty for no expiration"
            />
          </QForm>

          <div class="tw:flex tw:justify-end tw:gap-3 tw:mt-2">
            <WBtn flat label="Cancel" color="grey-7" @click="resetAndClose" />
            <WBtn
              label="Create Key"
              color="primary"
              unelevated
              class="tw:px-6 tw:font-bold"
              :loading="loading"
              :disable="loading"
              @click="handleSubmit"
            />
          </div>
        </template>

        <!-- Key Created Success -->
        <template v-else>
          <div
            class="tw:bg-amber-50 tw:border tw:border-amber-200 tw:rounded-lg tw:p-3 tw:flex tw:items-start tw:gap-2"
          >
            <WIcon name="warning" size="20px" class="tw:text-amber-600 tw:mt-0.5" />
            <div class="tw:text-sm tw:text-amber-800">
              Copy this key now. You won't be able to see it again.
            </div>
          </div>

          <div class="tw:flex tw:items-center tw:gap-2">
            <WInput
              :modelValue="createdKey"
              readonly
              dense
              class="tw:flex-1 tw:font-mono tw:text-sm"
            />
            <WBtn icon="content_copy" flat round dense color="primary" @click="handleCopyKey" />
          </div>

          <div class="tw:flex tw:justify-end tw:mt-2">
            <WBtn
              label="Done"
              color="primary"
              unelevated
              class="tw:px-6 tw:font-bold"
              @click="resetAndClose"
            />
          </div>
        </template>
      </div>
    </div>
  </QDialog>
</template>

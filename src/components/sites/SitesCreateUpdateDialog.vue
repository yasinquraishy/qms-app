<script setup>
import { useDebounceFn } from '@vueuse/core'
import { useQuasar } from 'quasar'
import { required, helpers } from '@vuelidate/validators'
import { useValidator } from '@shared/composables/validator.js'
import { useSites } from '@/composables/useSites.js'

const props = defineProps({
  id: {
    type: [String, Number],
    default: null,
  },
})

const emit = defineEmits(['created', 'updated'])

const open = defineModel({
  type: Boolean,
  default: false,
})

const { checkCodeAvailability, createSite, updateSite, sites } = useSites()
const $q = useQuasar()

// Dialog State (handled by defineModel above)

const form = ref({
  name: '',
  code: '',
  address: '',
  timezone: '',
})

const rules = computed(() => ({
  name: { required: helpers.withMessage('Required', required) },
  code: { required: helpers.withMessage('Required', required) },
}))

const validator = useValidator(rules, form)

const isChecking = ref(false)
const isAvailable = ref(null) // null | true | false
const isSubmitting = ref(false)

const isEdit = computed(() => !!props.id)

// Load site data if editing
watch(
  () => props.id,
  (newId) => {
    if (newId) {
      const site = sites.value.find((s) => s.id === newId)
      if (site) {
        form.value = { ...site }
        isAvailable.value = true // Existing code is valid
      }
    }
  },
  { immediate: true },
)

// Reset form when closed
watch(open, (val) => {
  if (!val) {
    if (!props.id) {
      form.value = {
        name: '',
        code: '',
        address: '',
        timezone: '',
      }
      isAvailable.value = null
    }
  }
})

// Auto-check availability when code changes (debounced)
const checkAvailabilityDebounced = useDebounceFn(async (newCode) => {
  if (!newCode || newCode.trim().length < 2) return

  isChecking.value = true
  const result = await checkCodeAvailability(newCode.trim(), '', false, props.id)
  isChecking.value = false
  if (result && result.message === 'available') {
    isAvailable.value = true
  } else {
    isAvailable.value = false
  }
}, 500)

watch(
  () => form.value.code,
  (newCode) => {
    isAvailable.value = null
    checkAvailabilityDebounced(newCode)
  },
)

// Auto-suggest code when name changes
async function onNameBlur() {
  if (!form.value.name || form.value.code) return

  const result = await checkCodeAvailability(null, form.value.name, true)
  if (result && result.suggestedCode) {
    form.value.code = result.suggestedCode
    // Trigger code availability check explicitly as setting it programmatically might need validation
  }
}

async function onSubmit() {
  const valid = await validator.value.$validate()
  if (!valid || isAvailable.value !== true) return

  isSubmitting.value = true
  let result
  if (isEdit.value) {
    result = await updateSite(props.id, {
      name: form.value.name,
      address: form.value.address,
      timezone: form.value.timezone || 'UTC',
    })
  } else {
    result = await createSite({
      name: form.value.name,
      code: form.value.code,
      address: form.value.address,
      timezone: form.value.timezone || 'UTC',
    })
  }
  isSubmitting.value = false

  if (result.error) {
    $q.notify({
      type: 'negative',
      message: result.error,
    })
  } else {
    $q.notify({
      type: 'positive',
      message: isEdit.value ? 'Site updated successfully' : 'Site created successfully',
    })
    if (isEdit.value) {
      emit('updated', result.site)
    } else {
      emit('created', result.site)
    }
    open.value = false
  }
}
</script>

<template>
  <WDialog v-model="open" :title="isEdit ? 'Edit Site' : 'Create New Site'">
    <div class="tw:flex tw:flex-col tw:gap-4">
      <WInput
        v-model="form.name"
        name="name"
        label="Site Name"
        placeholder="e.g. New York Headquarters"
        @blur="onNameBlur"
      >
        <template #label> Site Name <span class="tw:text-bad">*</span> </template>
      </WInput>

      <WInput
        v-model="form.code"
        name="code"
        label="Site Code"
        placeholder="e.g. NY-HQ"
        hint="Unique identifier for this site."
        :loading="isChecking"
        :disable="isEdit"
      >
        <template #label> Code <span class="tw:text-bad">*</span> </template>
        <template #append>
          <WIcon
            v-if="!isChecking && isAvailable === true"
            name="check_circle"
            color="positive"
            size="xs"
          />
          <WIcon
            v-if="!isChecking && isAvailable === false"
            name="cancel"
            color="negative"
            size="xs"
          />
        </template>
      </WInput>

      <WInput
        v-model="form.address"
        label="Address"
        placeholder="e.g. 123 Main St, New York, NY"
        type="textarea"
        autogrow
      />

      <TimezoneDropdown v-model="form.timezone" hint="Select primary timezone for this site." />
    </div>

    <template #actions>
      <WBtn flat label="Cancel" color="primary" @click="open = false" />
      <WBtn
        :label="isEdit ? 'Update Site' : 'Create Site'"
        color="primary"
        unelevated
        :loading="isSubmitting"
        :disable="isSubmitting"
        @click="onSubmit"
      />
    </template>
  </WDialog>
</template>

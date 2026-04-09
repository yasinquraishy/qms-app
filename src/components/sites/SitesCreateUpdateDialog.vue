<script setup>
import { IconBuilding, IconCircleCheck, IconX } from '@tabler/icons-vue'
import { useDebounceFn } from '@vueuse/core'
import { useQuasar } from 'quasar'
import { useSites } from '@/composables/useSites.js'

const props = defineProps({
  id: {
    type: [String, Number],
    default: null,
  },
})

const emit = defineEmits(['created', 'updated'])

const show = defineModel({ type: Boolean, default: false })

const { checkCodeAvailability, createSite, updateSite, sites } = useSites()
const $q = useQuasar()

const form = ref({
  name: '',
  code: '',
  address: '',
  timezone: '',
})

const isChecking = ref(false)
const isAvailable = ref(null) // null | true | false
const isSubmitting = ref(false)

const isEdit = computed(() => !!props.id)

const isFormValid = computed(() => {
  return form.value.name.trim() && form.value.code.trim()
})

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

// Reset form when dialog closes
watch(show, (val) => {
  if (!val) {
    resetForm()
  }
})

function resetForm() {
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
  }
}

async function handleSubmit() {
  if (!isFormValid.value || isAvailable.value !== true) return

  isSubmitting.value = true
  try {
    if (isEdit.value) {
      const result = await updateSite(props.id, {
        name: form.value.name,
        address: form.value.address,
        timezone: form.value.timezone || 'UTC',
      })
      $q.notify({
        type: 'positive',
        message: 'Site updated successfully',
      })
      emit('updated', result)
    } else {
      const result = await createSite({
        name: form.value.name,
        code: form.value.code,
        address: form.value.address,
        timezone: form.value.timezone || 'UTC',
      })
      $q.notify({
        type: 'positive',
        message: 'Site created successfully',
      })
      emit('created', result)
    }
    show.value = false
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: err.message || 'An error occurred',
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <BaseDialog v-model="show" maxWidth="md" @hide="resetForm">
    <template #title>
      <div class="tw:flex tw:items-center tw:gap-3">
        <div
          class="tw:w-9 tw:h-9 tw:bg-primary/10 tw:text-primary tw:rounded-xl tw:flex tw:items-center tw:justify-center"
        >
          <IconBuilding :size="20" />
        </div>
        <span>{{ isEdit ? 'Edit Site' : 'Create New Site' }}</span>
      </div>
    </template>

    <div class="tw:flex tw:flex-col tw:gap-4">
      <BaseTextInput
        v-model="form.name"
        label="Site Name"
        placeholder="e.g. New York Headquarters"
        :required="true"
        autofocus
        @blur="onNameBlur"
      />

      <BaseTextInput
        v-model="form.code"
        label="Code"
        placeholder="e.g. NY-HQ"
        hint="Unique identifier for this site."
        :required="true"
        :disabled="isEdit"
        :errorMsg="!isChecking && isAvailable === false ? 'Code is already in use' : ''"
      >
        <template #append>
          <IconCircleCheck
            v-if="!isChecking && isAvailable === true"
            class="tw:text-positive tw:w-4 tw:h-4"
          />
          <IconX v-if="!isChecking && isAvailable === false" class="tw:text-negative tw:w-4 tw:h-4" />
        </template>
      </BaseTextInput>

      <BaseTextarea
        v-model="form.address"
        label="Address"
        placeholder="e.g. 123 Main St, New York, NY"
      />

      <TimezoneDropdown v-model="form.timezone" hint="Select primary timezone for this site." />
    </div>

    <template #footer="{ close }">
      <BaseButton variant="outline" @click="close">Cancel</BaseButton>
      <BaseButton
        :isLoading="isSubmitting"
        :disabled="!isFormValid || isAvailable !== true"
        @click="handleSubmit"
      >
        {{ isEdit ? 'Update Site' : 'Create Site' }}
      </BaseButton>
    </template>
  </BaseDialog>
</template>

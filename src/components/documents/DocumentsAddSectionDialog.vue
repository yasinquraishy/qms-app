<script setup>
import { useQuasar } from 'quasar'
import { required, helpers } from '@vuelidate/validators'
import { useValidator } from '@shared/composables/validator.js'

const props = defineProps({
  currentVersion: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['sectionAdded'])

const open = defineModel({
  type: Boolean,
  default: false,
})

const $q = useQuasar()

// Form state
const newSection = ref({ title: '', sectionType: 'text' })

const sectionRules = computed(() => ({
  title: { required: helpers.withMessage('Title is required', required) },
}))

const sectionValidator = useValidator(sectionRules, newSection)

// Reset form when dialog closes
watch(open, (val) => {
  if (!val) {
    newSection.value = { title: '', sectionType: 'text' }
  }
})

async function handleAddSection() {
  const valid = await sectionValidator.value.$validate()
  if (!valid) return

  // Create a new section object
  const section = {
    id: crypto.randomUUID(),
    title: newSection.value.title,
    sectionType: newSection.value.sectionType,
    content: newSection.value.sectionType === 'text' ? '' : null,
    attachments: newSection.value.sectionType === 'attachment' ? [] : null,
  }

  // Add to current version sections
  if (props.currentVersion) {
    if (!props.currentVersion.sections) {
      props.currentVersion.sections = []
    }
    props.currentVersion.sections.push(section)
  }

  $q.notify({ type: 'positive', message: 'Section added successfully' })
  emit('sectionAdded', section)
  open.value = false
}

function closeDialog() {
  open.value = false
}
</script>

<template>
  <WDialog v-model="open" tag="form" title="Add New Section" persistent minWidth="400px">
    <template #default>
      <div class="tw:space-y-4">
        <!-- Section Title -->
        <WInput
          v-model="newSection.title"
          name="title"
          label="Section Title"
          outlined
          dense
          autofocus
        >
          <template #prepend>
            <WIcon name="title" />
          </template>
        </WInput>

        <!-- Section Type -->
        <WSelect
          v-model="newSection.sectionType"
          label="Section Type"
          outlined
          dense
          :options="[
            { label: 'Text Content', value: 'text' },
            { label: 'Attachments', value: 'attachment' },
          ]"
          optionLabel="label"
          optionValue="value"
          emitValue
          mapOptions
        >
          <template #prepend>
            <WIcon :name="newSection.sectionType === 'text' ? 'notes' : 'attach_file'" />
          </template>
        </WSelect>
      </div>
    </template>

    <template #actions>
      <WBtn flat label="Cancel" @click="closeDialog" />
      <WBtn
        type="submit"
        unelevated
        color="primary"
        label="Add Section"
        @click="handleAddSection"
      />
    </template>
  </WDialog>
</template>

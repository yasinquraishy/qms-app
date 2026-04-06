<script setup>
import { required, helpers } from '@vuelidate/validators'
import { useValidator } from '@shared/composables/validator.js'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  initialUrl: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'submit', 'remove'])

const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const linkUrl = ref('')
const linkText = ref('')

const linkForm = reactive({ url: linkUrl })
const linkRules = computed(() => ({
  url: {
    required: helpers.withMessage('URL is required', required),
    validUrl: helpers.withMessage('Please enter a valid URL', (val) => !val || val.includes('.')),
  },
}))

const linkValidator = useValidator(linkRules, linkForm, { $stopPropagation: true })

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      linkUrl.value = props.initialUrl || ''
      linkText.value = ''
    }
  },
)

async function handleSubmit() {
  const valid = await linkValidator.value.$validate()
  if (!valid) return

  // Basic URL validation and formatting
  let url = linkUrl.value.trim()
  if (url && !url.match(/^https?:\/\//)) {
    url = 'https://' + url
  }

  emit('submit', { url, text: linkText.value.trim() })
  show.value = false
}

function handleRemove() {
  emit('remove')
  show.value = false
}

function handleKeydown(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSubmit()
  }
}
</script>

<template>
  <QDialog v-model="show" @hide="show = false">
    <QCard class="tw:min-w-96">
      <QCardSection class="tw:flex tw:items-center tw:justify-between">
        <div class="tw:text-lg tw:font-semibold">
          {{ initialUrl ? 'Edit Link' : 'Insert Link' }}
        </div>
        <WBtn flat round dense icon="close" @click="show = false" />
      </QCardSection>

      <QCardSection class="tw:space-y-4">
        <WInput
          v-model="linkUrl"
          name="url"
          label="URL"
          outlined
          placeholder="https://example.com"
          autofocus
          dense
          @keydown="handleKeydown"
        >
          <template #prepend>
            <WIcon icon="link" />
          </template>
        </WInput>

        <WInput
          v-model="linkText"
          label="Link Text (optional)"
          outlined
          placeholder="Leave empty to use selection"
          dense
          @keydown="handleKeydown"
        >
          <template #prepend>
            <WIcon icon="title" />
          </template>
        </WInput>
      </QCardSection>

      <QCardActions class="tw:justify-between tw:px-4 tw:pb-4">
        <div>
          <WBtn
            v-if="initialUrl"
            flat
            color="negative"
            label="Remove Link"
            icon="link_off"
            @click="handleRemove"
          />
        </div>
        <div class="tw:flex tw:gap-2">
          <WBtn flat label="Cancel" @click="show = false" />
          <WBtn unelevated color="primary" label="Apply" icon="check" @click="handleSubmit" />
        </div>
      </QCardActions>
    </QCard>
  </QDialog>
</template>

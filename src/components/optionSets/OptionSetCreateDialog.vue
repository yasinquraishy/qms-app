<script setup>
import { required, helpers } from '@vuelidate/validators'
import { useValidator } from '@shared/composables/validator.js'
import { useOptionSets } from '@/composables/useOptionSets.js'

const show = defineModel({ type: Boolean, default: false })

const router = useRouter()
const route = useRoute()
const { createOptionSet } = useOptionSets()

const form = ref({
  name: '',
  description: '',
})

const rules = computed(() => ({
  name: { required: helpers.withMessage('Name is required', required) },
}))

const validator = useValidator(rules, form)

const loading = ref(false)

async function handleSubmit() {
  const valid = await validator.value.$validate()
  if (!valid) return

  loading.value = true
  try {
    const newSet = await createOptionSet(form.value)
    show.value = false
    form.value = { name: '', description: '' }
    router.push({ params: { ...route.params, id: newSet.id } })
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
          <div class="tw:text-2xl tw:font-bold tw:text-on-main">Create Option Set</div>
        </div>

        <div class="tw:text-sm tw:text-secondary tw:leading-relaxed">
          Reusable option sets can be used across multiple forms for dropdowns, checkboxes, and
          radio groups.
        </div>

        <QForm class="tw:flex tw:flex-col tw:gap-4" @submit="handleSubmit">
          <WInput
            v-model="form.name"
            name="name"
            label="Name"
            placeholder="e.g., Priority Levels"
            autofocus
          />
          <WInput
            v-model="form.description"
            label="Description"
            placeholder="Briefly describe what these options are for"
            type="textarea"
            class="tw:h-24"
          />
        </QForm>

        <div class="tw:flex tw:justify-end tw:gap-3 tw:mt-7 tw:mp-2">
          <WBtn flat label="Cancel" color="grey-7" @click="show = false" />
          <WBtn
            label="Create Set"
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

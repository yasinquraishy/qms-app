<script setup>
import { required, helpers } from '@vuelidate/validators'
import { useValidator } from '@shared/composables/validator.js'

const model = defineModel({ type: Object, required: true })

const rules = computed(() => ({
  name: { required: helpers.withMessage('Company name is required', required) },
}))

useValidator(rules, model)
</script>

<template>
  <div
    class="tw:rounded-xl tw:border tw:border-divider tw:shadow-sm tw:overflow-hidden tw:bg-sidebar"
  >
    <!-- Card Header -->
    <div class="tw:px-6 tw:py-4 tw:border-b tw:border-divider tw:bg-main-hover">
      <h2 class="tw:text-lg tw:font-bold tw:text-on-sidebar">General Information</h2>
    </div>

    <!-- Card Content -->
    <div class="tw:p-6 tw:grid tw:grid-cols-1 tw:md:grid-cols-2 tw:gap-6">
      <!-- Company Name -->
      <WInput
        v-model="model.name"
        name="name"
        label="Company Name"
        placeholder="Enter company name"
      />

      <!-- Company Code (Disabled) -->
      <WInput
        v-model="model.code"
        label="Company Code"
        placeholder="Company code"
        :disable="true"
        class="tw:opacity-70"
        hint="System-generated code (read-only)"
      />
    </div>
  </div>
</template>

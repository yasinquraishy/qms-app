<script setup>
const model = defineModel({ type: Object, required: true })
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
      <BaseTextInput v-model="model.name" label="Company Name" placeholder="Enter company name" />

      <!-- Company Code (Disabled) -->
      <BaseTextInput
        v-model="model.code"
        label="Company Code"
        placeholder="Company code"
        :disabled="true"
        class="tw:opacity-70"
        hint="System-generated code (read-only)"
      />
    </div>
  </div>
</template>

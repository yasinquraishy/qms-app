<script setup>
const field = defineModel('field', {
  type: Object,
  required: true,
})
</script>

<template>
  <div class="tw:mb-4 tw:last:mb-0">
    <div
      class="tw:font-semibold tw:text-xs tw:uppercase tw:tracking-wide tw:text-secondary tw:mb-2 tw:pb-2 tw:border-b tw:border-divider"
    >
      Styling
    </div>

    <div
      class="tw:mb-3 tw:text-xs tw:text-on-sidebar tw:bg-main-selected tw:p-2 tw:rounded tw:border tw:border-primary/20"
    >
      <div class="tw:mb-1 tw:flex tw:items-center">
        <WIcon icon="info" size="14px" class="tw:text-primary tw:mr-1" />
        <strong>Advanced Settings</strong>
      </div>
      <div class="tw:mb-1">Only modify these settings if you are familiar with CSS.</div>
      <div>
        Useful references:
        <ul class="tw:pl-4 tw:my-1 tw:pr-2">
          <li>
            <a href="https://quasar.dev/style/typography" target="_blank" class="tw:text-primary"
              >Typography</a
            >
          </li>
          <li>
            <a
              href="https://quasar.dev/layout/grid/introduction-to-flexbox"
              target="_blank"
              class="tw:text-primary"
              >Flexbox & Grid</a
            >
          </li>
        </ul>
      </div>
    </div>

    <div class="tw:flex tw:flex-col tw:gap-3">
      <WInput v-model="field.class" label="CSS Classes" placeholder="col-6 q-mb-md" />

      <WInput v-model="field.style" label="Inline Styles" placeholder="width: 100%" />
    </div>
  </div>
</template>

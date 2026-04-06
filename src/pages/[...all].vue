<script setup>
defineOptions({
  name: 'ErrorNotFound',
})
</script>

<template>
  <div
    class="tw:fixed tw:inset-0 tw:bg-primary tw:text-on-primary tw:flex tw:items-center tw:justify-center tw:text-center tw:p-6"
  >
    <div class="tw:flex tw:flex-col tw:items-center tw:gap-8">
      <div class="tw:text-[30vh] tw:font-bold tw:leading-none tw:opacity-20">404</div>

      <div class="tw:text-3xl tw:font-bold tw:opacity-60">Oops. Nothing here...</div>

      <WBtn
        class="tw:mt-8 tw:px-8 tw:font-bold"
        color="white"
        textColor="primary"
        unelevated
        to="/"
        label="Go Home"
        size="lg"
      />
    </div>
  </div>
</template>

<route lang="yaml">
meta:
  layout: false
</route>

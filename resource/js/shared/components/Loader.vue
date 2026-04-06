<script setup>
defineOptions({
  name: 'AppLoader',
})

const modelValue = defineModel('loadingVal', {
  required: true,
  type: Boolean,
})
</script>

<template>
  <WDialog
    v-model="modelValue"
    persistent
    minWidth="200px"
    maxWidth="200px"
    bodyClass="q-pa-lg text-center"
    :close="false"
  >
    <div class="column items-center q-gutter-y-md">
      <div class="text-body1">Please wait...</div>
    </div>
  </WDialog>
</template>

<style lang="scss">
// Using Quasar's utility classes
</style>

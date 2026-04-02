<script setup>
const props = defineProps({
  steps: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['stepClick'])

const currentStep = defineModel({ type: Number, required: true })

const handleStepClick = (stepIndex) => {
  const step = props.steps[stepIndex]

  if (step.disabled) {
    return
  }

  emit('stepClick', stepIndex)

  currentStep.value = stepIndex + 1
}
</script>

<template>
  <div class="row items-stretch no-wrap">
    <div class="stepper-navigation">
      <QList separator>
        <template v-for="(step, index) in props.steps" :key="index + step.title">
          <QItem
            clickable
            :active="currentStep === index + 1 || currentStep > index + 1"
            :disable="step.disabled"
            :class="{ 'step-active': currentStep === index + 1 }"
            @click="handleStepClick(index)"
          >
            <QItemSection side>
              <WIcon v-if="step.icon" :icon="step.icon" />
              <div v-else>
                {{ index + 1 }}
              </div>
            </QItemSection>
            <QItemSection>
              <QItemLabel>{{ step.title }}</QItemLabel>
            </QItemSection>
          </QItem>
        </template>
      </QList>
    </div>
    <div class="stepper-content q-pa-md">
      <slot name="content" :step="currentStep" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.stepper-navigation {
  flex-shrink: 0;
  border-inline-end: 1px solid #e0e0e0;
  min-block-size: 400px;
  min-inline-size: 200px;
}

.stepper-content {
  overflow: auto;
  flex: 1;
  min-inline-size: 0;
}

/* stylelint-disable-next-line selector-pseudo-class-no-unknown */
.step-active :deep(.q-focus-helper) {
  background-color: currentcolor;
  opacity: 0.15;
}
</style>

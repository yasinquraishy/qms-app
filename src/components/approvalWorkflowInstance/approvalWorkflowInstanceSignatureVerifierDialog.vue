<script setup>
// Props
const props = defineProps({
  actionLoading: { type: Boolean, default: false },
  // optionally display masked email address
  email: { type: String, default: '' },
})

const emit = defineEmits(['confirm'])

const show = defineModel({ type: Boolean, default: false })

// six-digit code state
const code = ref(['', '', '', '', '', ''])
const inputs = ref([])

// clear when opened
watch(show, (val) => {
  if (val) {
    code.value = ['', '', '', '', '', '']
    // focus first input after render
    nextTick(() => {
      inputs.value[0]?.focus()
    })
  }
})

// computed for whether the code is complete
const isComplete = computed(() => code.value.every((d) => d && d.length === 1))

function setInputRef(el, index) {
  if (el) {
    inputs.value[index] = el
  }
}

function onInput(e, index) {
  let val = e.target.value
  if (val.length > 1) {
    val = val.slice(0, 1)
  }
  code.value[index] = val
  if (val && index < inputs.value.length - 1) {
    inputs.value[index + 1].focus()
  }
}

function onKeydown(e, index) {
  if (e.key === 'Backspace' && !code.value[index] && index > 0) {
    inputs.value[index - 1].focus()
  }
}

function confirm() {
  if (!isComplete.value) return
  emit('confirm', code.value.join(''))
  show.value = false
}

// mask email for display
const maskedEmail = computed(() => {
  if (!props.email) return ''
  const parts = props.email.split('@')
  if (parts[0].length <= 2) return props.email
  return parts[0].slice(0, 2) + '***@' + parts[1]
})
</script>

<template>
  <WDialog v-model="show" title="Verify Signature" minWidth="440px" persistent>
    <div class="tw-text-sm tw-text-secondary tw-mb-4">
      We've sent a 6-digit verification code to your registered email
      <span class="tw-font-medium tw-text-secondary">{{ maskedEmail }}</span
      >. Please enter it below to verify your signature.
    </div>

    <div class="tw-flex tw-justify-between tw-gap-2 sm:tw-gap-4" data-purpose="otp-input-group">
      <input
        v-for="(digit, i) in code"
        :key="i"
        :ref="(el) => setInputRef(el, i)"
        v-model="code[i]"
        maxlength="1"
        type="number"
        class="otp-input tw-w-full tw-h-14 tw-text-center tw-text-xl tw-font-bold tw-border-gray-300 tw-bg-gray-50 tw-rounded-input tw-transition-all"
        @input="onInput($event, i)"
        @keydown="onKeydown($event, i)"
      />
    </div>

    <div class="tw-text-sm tw-mt-4">
      <p class="tw-text-gray-400">
        Didn't receive the code?
        <button
          class="tw-text-gray-400 tw-font-medium tw-cursor-not-allowed tw-ml-1"
          disabled
          type="button"
        >
          Resend code
        </button>
      </p>
    </div>

    <template #actions>
      <WBtn flat label="Cancel" @click="show = false" />
      <WBtn
        color="primary"
        unelevated
        label="Verify"
        :loading="props.actionLoading"
        :disable="!isComplete"
        @click="confirm"
      />
    </template>
  </WDialog>
</template>

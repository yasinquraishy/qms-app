<script setup>
import { useQuasar } from 'quasar'
import { useAuth } from '@/composables/useAuth.js'

const router = useRouter()
const $q = useQuasar()
const { requestPasswordReset, loading } = useAuth()

const email = ref('')
const submitted = ref(false)

function isValidEmail(emailValue) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(emailValue)
}

async function handleSubmit() {
  if (!email.value) {
    $q.notify({
      type: 'negative',
      message: 'Please enter your email address',
      position: 'top',
    })
    return
  }

  if (!isValidEmail(email.value)) {
    $q.notify({
      type: 'negative',
      message: 'Please enter a valid email address',
      position: 'top',
    })
    return
  }

  await requestPasswordReset(email.value)
  submitted.value = true
}

function goToLogin() {
  router.push('/signin')
}
</script>

<template>
  <WCard v-if="!submitted" class="login-card" flat>
    <QCardSection class="tw:pb-1">
      <div class="tw:text-2xl tw:font-bold tw:text-on-main">Reset your password</div>
      <div class="tw:text-sm tw:text-secondary tw:mt-1">
        Enter your email address and we'll send you a link to reset your password.
      </div>
    </QCardSection>

    <QCardSection class="tw:pt-4">
      <div class="tw:flex tw:flex-col tw:gap-4">
        <WInput
          v-model="email"
          type="email"
          placeholder="Email"
          outlined
          dense
          autocomplete="email"
          :disable="loading"
          @keyup.enter="handleSubmit"
        >
          <template #prepend>
            <WIcon name="email" />
          </template>
        </WInput>

        <WBtn
          unelevated
          noCaps
          color="primary"
          class="tw:w-full"
          :loading="loading"
          :disable="loading || !email"
          @click="handleSubmit"
        >
          Send reset link
        </WBtn>

        <div class="tw:text-center">
          <a href="#" class="tw:text-sm tw:text-primary" @click.prevent="goToLogin">
            Back to sign in
          </a>
        </div>
      </div>
    </QCardSection>
  </WCard>

  <!-- Success message -->
  <WCard v-else class="login-card" flat>
    <QCardSection class="tw:text-center tw:py-8">
      <div class="tw:mb-4">
        <WIcon name="mark_email_read" size="64px" color="positive" />
      </div>
      <div class="tw:text-2xl tw:font-bold tw:text-on-main tw:mb-2">Check your email</div>
      <div class="tw:text-sm tw:text-secondary tw:mb-6">
        If an account exists for {{ email }}, you will receive a password reset link shortly.
      </div>
      <WBtn unelevated noCaps color="primary" @click="goToLogin"> Back to sign in </WBtn>
    </QCardSection>
  </WCard>
</template>

<style lang="scss" scoped>
.login-card {
  width: 100%;
  max-width: 420px;
  background-color: $content-bg;
}

a {
  color: $primary;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}
</style>

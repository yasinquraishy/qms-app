<script setup>
import { useQuasar } from 'quasar'
import { useAuth } from '@/composables/useAuth.js'

const router = useRouter()
const route = useRoute()
const $q = useQuasar()
const { confirmPasswordReset, loading } = useAuth()

const password = ref('')
const confirmPassword = ref('')
const token = ref('')

// Get token from URL query parameter
onMounted(() => {
  token.value = route.query.token || ''
  if (!token.value) {
    $q.notify({
      type: 'negative',
      message: 'Invalid or missing reset token',
      position: 'top',
    })
    router.push('/signin')
  }
})

function validatePassword(passwordValue) {
  if (!passwordValue) {
    return 'Password is required'
  }
  if (passwordValue.length < 8) {
    return 'Password must be at least 8 characters long'
  }
  return null
}

function validateConfirmPassword(confirmPasswordValue) {
  if (!confirmPasswordValue) {
    return 'Please confirm your password'
  }
  if (confirmPasswordValue !== password.value) {
    return 'Passwords do not match'
  }
  return null
}

async function handleSubmit() {
  // Validate password
  const passwordError = validatePassword(password.value)
  if (passwordError) {
    $q.notify({
      type: 'negative',
      message: passwordError,
      position: 'top',
    })
    return
  }

  // Validate confirm password
  const confirmPasswordError = validateConfirmPassword(confirmPassword.value)
  if (confirmPasswordError) {
    $q.notify({
      type: 'negative',
      message: confirmPasswordError,
      position: 'top',
    })
    return
  }

  await confirmPasswordReset(token.value, password.value)

  $q.notify({
    type: 'positive',
    message: 'Password updated successfully',
    position: 'top',
  })

  // Redirect to login page after successful reset
  setTimeout(() => {
    router.push('/signin')
  }, 1000)
}

function goToLogin() {
  router.push('/signin')
}
</script>

<template>
  <WCard class="login-card" flat>
    <QCardSection class="tw:pb-1">
      <div class="tw:text-2xl tw:font-bold tw:text-on-main">Set new password</div>
      <div class="tw:text-sm tw:text-secondary tw:mt-1">Enter your new password below.</div>
    </QCardSection>

    <QCardSection class="tw:pt-4">
      <div class="tw:flex tw:flex-col tw:gap-4">
        <WInput
          v-model="password"
          type="password"
          placeholder="New password"
          outlined
          dense
          autocomplete="new-password"
          :disable="loading"
          @keyup.enter="handleSubmit"
        >
          <template #prepend>
            <WIcon name="lock" />
          </template>
        </WInput>

        <WInput
          v-model="confirmPassword"
          type="password"
          placeholder="Confirm new password"
          outlined
          dense
          autocomplete="new-password"
          :disable="loading"
          @keyup.enter="handleSubmit"
        >
          <template #prepend>
            <WIcon name="lock" />
          </template>
        </WInput>

        <div class="tw:text-xs tw:text-secondary">Password must be at least 8 characters long</div>

        <WBtn
          unelevated
          noCaps
          color="primary"
          class="tw:w-full"
          :loading="loading"
          :disable="loading || !password || !confirmPassword"
          @click="handleSubmit"
        >
          Reset password
        </WBtn>

        <div class="tw:text-center">
          <a href="#" class="tw:text-sm tw:text-primary" @click.prevent="goToLogin">
            Back to sign in
          </a>
        </div>
      </div>
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
